import { Payroll } from "../models/Payroll";
import { Employee } from "../models/Employee";
import mongoose from "mongoose";
export const getAllPayrollRecords = async (req, res) => {
    try {
        const { page = 1, limit = 10, month, year, employeeId, status } = req.query;
        const filter = {};
        if (month)
            filter.month = parseInt(month);
        if (year)
            filter.year = parseInt(year);
        if (employeeId)
            filter.employee = employeeId;
        if (status)
            filter.status = status;
        if (req.user?.role === "Employee") {
            filter.employee = req.user.id;
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const [payrolls, total] = await Promise.all([
            Payroll.find(filter)
                .populate("employee", "firstName lastName email employeeId designation")
                .populate("generatedBy", "firstName lastName email")
                .populate("approvedBy", "firstName lastName email")
                .skip(skip)
                .limit(limitNum)
                .sort({ year: -1, month: -1 }),
            Payroll.countDocuments(filter)
        ]);
        res.status(200).json({
            success: true,
            data: payrolls,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch payroll records", error: error.message });
    }
};
export const getPayrollById = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id)
            .populate("employee", "firstName lastName email employeeId designation department")
            .populate("generatedBy", "firstName lastName email")
            .populate("approvedBy", "firstName lastName email");
        if (!payroll) {
            res.status(404).json({ success: false, message: "Payroll record not found" });
            return;
        }
        if (req.user?.role === "Employee" && payroll.employee._id.toString() !== req.user.id) {
            res.status(403).json({ success: false, message: "Access denied" });
            return;
        }
        res.status(200).json({ success: true, data: payroll });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch payroll record", error: error.message });
    }
};
export const getPayrollByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { year } = req.query;
        const filter = { employee: employeeId };
        if (year)
            filter.year = parseInt(year);
        if (req.user?.role === "Employee" && employeeId !== req.user.id) {
            res.status(403).json({ success: false, message: "Access denied" });
            return;
        }
        const payrolls = await Payroll.find(filter)
            .populate("employee", "firstName lastName email employeeId")
            .sort({ year: -1, month: -1 });
        res.status(200).json({ success: true, data: payrolls });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch employee payroll", error: error.message });
    }
};
export const generatePayroll = async (req, res) => {
    try {
        const { employeeId, month, year, salaryBreakdown, deductionBreakdown, presentDays } = req.body;
        const existingPayroll = await Payroll.findOne({ employee: employeeId, month, year });
        if (existingPayroll) {
            res.status(400).json({ success: false, message: "Payroll already exists for this month" });
            return;
        }
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            res.status(404).json({ success: false, message: "Employee not found" });
            return;
        }
        const basicSalary = salaryBreakdown?.basic || employee.salary;
        const hra = salaryBreakdown?.hra || basicSalary * 0.4;
        const da = salaryBreakdown?.da || basicSalary * 0.1;
        const ta = salaryBreakdown?.ta || basicSalary * 0.08;
        const medicalAllowance = salaryBreakdown?.medicalAllowance || 1250;
        const specialAllowance = salaryBreakdown?.specialAllowance || basicSalary * 0.15;
        const grossSalary = basicSalary + hra + da + ta + medicalAllowance + specialAllowance;
        const pf = deductionBreakdown?.providentFund || basicSalary * 0.12;
        const professionalTax = deductionBreakdown?.professionalTax || (basicSalary > 30000 ? 200 : 0);
        const tax = deductionBreakdown?.tax || (basicSalary > 100000 ? basicSalary * 0.05 : 0);
        const totalDeductions = pf + professionalTax + tax;
        const netSalary = grossSalary - totalDeductions;
        const payroll = await Payroll.create({
            employee: employeeId,
            month,
            year,
            salaryBreakdown: {
                basic: basicSalary,
                hra,
                da,
                ta,
                medicalAllowance,
                specialAllowance
            },
            grossSalary,
            deductionBreakdown: {
                tax,
                providentFund: pf,
                professionalTax
            },
            totalDeductions,
            netSalary,
            presentDays: presentDays || 26,
            totalWorkingDays: 30,
            status: "Processed",
            generatedBy: req.user?.id
        });
        res.status(201).json({ success: true, data: payroll, message: "Payroll generated successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to generate payroll", error: error.message });
    }
};
export const updatePayroll = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id);
        if (!payroll) {
            res.status(404).json({ success: false, message: "Payroll record not found" });
            return;
        }
        if (payroll.status === "Paid") {
            res.status(400).json({ success: false, message: "Cannot update paid payroll record" });
            return;
        }
        const updatedPayroll = await Payroll.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.user?.id }, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updatedPayroll, message: "Payroll updated successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to update payroll", error: error.message });
    }
};
export const processPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod, transactionId, notes } = req.body;
        const payroll = await Payroll.findById(id);
        if (!payroll) {
            res.status(404).json({ success: false, message: "Payroll record not found" });
            return;
        }
        if (payroll.status === "Paid") {
            res.status(400).json({ success: false, message: "Payroll already paid" });
            return;
        }
        payroll.status = "Paid";
        payroll.paymentDate = new Date();
        payroll.paymentMethod = paymentMethod || "Bank Transfer";
        payroll.transactionId = transactionId;
        payroll.notes = notes;
        payroll.approvedBy = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined;
        payroll.approvedAt = new Date();
        await payroll.save();
        res.status(200).json({ success: true, data: payroll, message: "Payment processed successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to process payment", error: error.message });
    }
};
export const deletePayroll = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id);
        if (!payroll) {
            res.status(404).json({ success: false, message: "Payroll record not found" });
            return;
        }
        await payroll.deleteOne();
        res.status(200).json({ success: true, message: "Payroll record deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete payroll", error: error.message });
    }
};
export const getPayrollSummary = async (req, res) => {
    try {
        const { year, month } = req.query;
        const filter = {};
        if (year)
            filter.year = parseInt(year);
        if (month)
            filter.month = parseInt(month);
        const payrolls = await Payroll.find(filter).populate("employee", "firstName lastName department");
        const summary = {
            totalRecords: payrolls.length,
            totalGrossSalary: payrolls.reduce((sum, p) => sum + p.grossSalary, 0),
            totalDeductions: payrolls.reduce((sum, p) => sum + p.totalDeductions, 0),
            totalNetSalary: payrolls.reduce((sum, p) => sum + p.netSalary, 0),
            paidCount: payrolls.filter((p) => p.status === "Paid").length,
            pendingCount: payrolls.filter((p) => p.status !== "Paid").length
        };
        res.status(200).json({ success: true, data: summary });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch payroll summary", error: error.message });
    }
};
export const calculateNetPay = async (req, res) => {
    try {
        const { employeeId, month, year } = req.query;
        const filter = {};
        if (employeeId)
            filter.employee = employeeId;
        if (month)
            filter.month = parseInt(month);
        if (year)
            filter.year = parseInt(year);
        const result = await Payroll.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "employee",
                    foreignField: "_id",
                    as: "employeeInfo"
                }
            },
            {
                $unwind: {
                    path: "$employeeInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    employee: {
                        _id: "$employeeInfo._id",
                        employeeId: "$employeeInfo.employeeId",
                        firstName: "$employeeInfo.firstName",
                        lastName: "$employeeInfo.lastName",
                        fullName: { $concat: ["$employeeInfo.firstName", " ", "$employeeInfo.lastName"] },
                        designation: "$employeeInfo.designation"
                    },
                    month: 1,
                    year: 1,
                    basicSalary: "$salaryBreakdown.basic",
                    hra: "$salaryBreakdown.hra",
                    da: "$salaryBreakdown.da",
                    ta: "$salaryBreakdown.ta",
                    medicalAllowance: "$salaryBreakdown.medicalAllowance",
                    specialAllowance: "$salaryBreakdown.specialAllowance",
                    bonus: "$salaryBreakdown.bonus",
                    otherEarnings: "$salaryBreakdown.otherEarnings",
                    tax: "$deductionBreakdown.tax",
                    providentFund: "$deductionBreakdown.providentFund",
                    professionalTax: "$deductionBreakdown.professionalTax",
                    insurance: "$deductionBreakdown.insurance",
                    loanDeduction: "$deductionBreakdown.loanDeduction",
                    otherDeductions: "$deductionBreakdown.otherDeductions",
                    grossSalary: 1,
                    totalDeductions: 1,
                    netSalary: 1,
                    status: 1,
                    paymentDate: 1
                }
            },
            {
                $sort: { year: -1, month: -1 }
            }
        ]);
        res.status(200).json({
            success: true,
            count: result.length,
            data: result
        });
    }
    catch (error) {
        console.error("Calculate net pay error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to calculate net pay",
            error: error.message
        });
    }
};
export const getEmployeePayrollSummary = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const currentYear = new Date().getFullYear();
        const result = await Payroll.aggregate([
            {
                $match: {
                    employee: new mongoose.Types.ObjectId(employeeId),
                    year: currentYear
                }
            },
            {
                $group: {
                    _id: "$employee",
                    totalBasicSalary: { $sum: "$salaryBreakdown.basic" },
                    totalGrossSalary: { $sum: "$grossSalary" },
                    totalDeductions: { $sum: "$totalDeductions" },
                    totalNetSalary: { $sum: "$netSalary" },
                    totalTax: { $sum: "$deductionBreakdown.tax" },
                    totalPF: { $sum: "$deductionBreakdown.providentFund" },
                    averageMonthlyNet: { $avg: "$netSalary" },
                    monthsCount: { $sum: 1 },
                    paidMonths: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Paid"] }, 1, 0]
                        }
                    },
                    pendingMonths: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Processed"] }, 1, 0]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "_id",
                    foreignField: "_id",
                    as: "employeeInfo"
                }
            },
            {
                $unwind: {
                    path: "$employeeInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 0,
                    employee: {
                        _id: "$employeeInfo._id",
                        employeeId: "$employeeInfo.employeeId",
                        fullName: { $concat: ["$employeeInfo.firstName", " ", "$employeeInfo.lastName"] },
                        designation: "$employeeInfo.designation"
                    },
                    year: currentYear,
                    totalBasicSalary: 1,
                    totalGrossSalary: 1,
                    totalDeductions: 1,
                    totalNetSalary: 1,
                    totalTax: 1,
                    totalPF: 1,
                    averageMonthlyNet: { $round: ["$averageMonthlyNet", 2] },
                    monthsCount: 1,
                    paidMonths: 1,
                    pendingMonths: 1
                }
            }
        ]);
        res.status(200).json({
            success: true,
            data: result.length > 0 ? result[0] : { message: "No payroll records found for this employee" }
        });
    }
    catch (error) {
        console.error("Employee payroll summary error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch employee payroll summary",
            error: error.message
        });
    }
};
export const getDepartmentPayrollStats = async (req, res) => {
    try {
        const { year, month } = req.query;
        const filter = {};
        if (year)
            filter.year = parseInt(year);
        if (month)
            filter.month = parseInt(month);
        const result = await Payroll.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "employee",
                    foreignField: "_id",
                    as: "employeeInfo"
                }
            },
            {
                $unwind: {
                    path: "$employeeInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "departments",
                    localField: "employeeInfo.department",
                    foreignField: "_id",
                    as: "dept"
                }
            },
            {
                $unwind: {
                    path: "$dept",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        departmentId: "$dept._id",
                        departmentName: "$dept.name",
                        departmentCode: "$dept.code",
                        year: "$year",
                        month: "$month"
                    },
                    totalEmployees: { $sum: 1 },
                    totalBasicSalary: { $sum: "$salaryBreakdown.basic" },
                    totalHRA: { $sum: "$salaryBreakdown.hra" },
                    totalGrossSalary: { $sum: "$grossSalary" },
                    totalDeductions: { $sum: "$totalDeductions" },
                    totalNetSalary: { $sum: "$netSalary" },
                    avgGrossSalary: { $avg: "$grossSalary" },
                    avgNetSalary: { $avg: "$netSalary" },
                    totalTax: { $sum: "$deductionBreakdown.tax" },
                    totalPF: { $sum: "$deductionBreakdown.providentFund" }
                }
            },
            {
                $sort: {
                    "_id.departmentName": 1,
                    "_id.year": -1,
                    "_id.month": -1
                }
            },
            {
                $project: {
                    _id: 0,
                    department: {
                        id: "$_id.departmentId",
                        name: "$_id.departmentName",
                        code: "$_id.departmentCode"
                    },
                    year: "$_id.year",
                    month: "$_id.month",
                    totalEmployees: 1,
                    totalBasicSalary: 1,
                    totalHRA: 1,
                    totalGrossSalary: 1,
                    totalDeductions: 1,
                    totalNetSalary: 1,
                    avgGrossSalary: { $round: ["$avgGrossSalary", 2] },
                    avgNetSalary: { $round: ["$avgNetSalary", 2] },
                    totalTax: 1,
                    totalPF: 1
                }
            }
        ]);
        const companyStats = {
            totalDepartments: result.length,
            totalPayroll: result.reduce((sum, dept) => sum + dept.totalGrossSalary, 0),
            totalNetPayroll: result.reduce((sum, dept) => sum + dept.totalNetSalary, 0),
            totalTax: result.reduce((sum, dept) => sum + dept.totalTax, 0),
            totalPF: result.reduce((sum, dept) => sum + dept.totalPF, 0)
        };
        res.status(200).json({
            success: true,
            companyStats,
            departments: result
        });
    }
    catch (error) {
        console.error("Department payroll stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch department payroll statistics",
            error: error.message
        });
    }
};
export const getMonthlyPayrollSummary = async (req, res) => {
    try {
        const { year, month } = req.query;
        const filter = {};
        if (year)
            filter.year = parseInt(year);
        if (month)
            filter.month = parseInt(month);
        const result = await Payroll.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "employee",
                    foreignField: "_id",
                    as: "employeeInfo"
                }
            },
            {
                $unwind: {
                    path: "$employeeInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        year: "$year",
                        month: "$month"
                    },
                    totalEmployees: { $sum: 1 },
                    totalBasicSalary: { $sum: "$salaryBreakdown.basic" },
                    totalHRA: { $sum: "$salaryBreakdown.hra" },
                    totalGrossSalary: { $sum: "$grossSalary" },
                    totalDeductions: { $sum: "$totalDeductions" },
                    totalNetSalary: { $sum: "$netSalary" },
                    totalTax: { $sum: "$deductionBreakdown.tax" },
                    totalPF: { $sum: "$deductionBreakdown.providentFund" },
                    avgGrossSalary: { $avg: "$grossSalary" },
                    avgNetSalary: { $avg: "$netSalary" },
                    paidCount: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Paid"] }, 1, 0]
                        }
                    },
                    pendingCount: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Processed"] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: {
                    "_id.year": -1,
                    "_id.month": -1
                }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    monthName: {
                        $let: {
                            vars: {
                                months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
                            },
                            in: { $arrayElemAt: ["$$months", { $subtract: ["$_id.month", 1] }] }
                        }
                    },
                    totalEmployees: 1,
                    totalBasicSalary: 1,
                    totalHRA: 1,
                    totalGrossSalary: 1,
                    totalDeductions: 1,
                    totalNetSalary: 1,
                    totalTax: 1,
                    totalPF: 1,
                    avgGrossSalary: { $round: ["$avgGrossSalary", 2] },
                    avgNetSalary: { $round: ["$avgNetSalary", 2] },
                    paidCount: 1,
                    pendingCount: 1
                }
            }
        ]);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error("Monthly payroll summary error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch monthly payroll summary",
            error: error.message
        });
    }
};
export const getTopEarners = async (req, res) => {
    try {
        const { year, month, limit = 10 } = req.query;
        const filter = {};
        if (year)
            filter.year = parseInt(year);
        if (month)
            filter.month = parseInt(month);
        const result = await Payroll.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "employee",
                    foreignField: "_id",
                    as: "employeeInfo"
                }
            },
            {
                $unwind: {
                    path: "$employeeInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "departments",
                    localField: "employeeInfo.department",
                    foreignField: "_id",
                    as: "dept"
                }
            },
            {
                $unwind: {
                    path: "$dept",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: {
                    netSalary: -1
                }
            },
            {
                $limit: parseInt(limit)
            },
            {
                $project: {
                    _id: 0,
                    employee: {
                        _id: "$employeeInfo._id",
                        employeeId: "$employeeInfo.employeeId",
                        fullName: { $concat: ["$employeeInfo.firstName", " ", "$employeeInfo.lastName"] },
                        designation: "$employeeInfo.designation"
                    },
                    department: {
                        name: "$dept.name",
                        code: "$dept.code"
                    },
                    month: 1,
                    year: 1,
                    basicSalary: "$salaryBreakdown.basic",
                    grossSalary: 1,
                    netSalary: 1,
                    status: 1
                }
            }
        ]);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error("Top earners error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch top earners",
            error: error.message
        });
    }
};
export const getTaxBreakdown = async (req, res) => {
    try {
        const { year } = req.query;
        const filter = {};
        if (year)
            filter.year = parseInt(year);
        const result = await Payroll.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "employee",
                    foreignField: "_id",
                    as: "employeeInfo"
                }
            },
            {
                $unwind: {
                    path: "$employeeInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "departments",
                    localField: "employeeInfo.department",
                    foreignField: "_id",
                    as: "dept"
                }
            },
            {
                $unwind: {
                    path: "$dept",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        employeeId: "$employeeInfo._id",
                        year: "$year"
                    },
                    employeeName: { $first: { $concat: ["$employeeInfo.firstName", " ", "$employeeInfo.lastName"] } },
                    employeeId: { $first: "$employeeInfo.employeeId" },
                    departmentName: { $first: "$dept.name" },
                    departmentCode: { $first: "$dept.code" },
                    totalGrossSalary: { $sum: "$grossSalary" },
                    totalTax: { $sum: "$deductionBreakdown.tax" },
                    totalPF: { $sum: "$deductionBreakdown.providentFund" },
                    totalProfessionalTax: { $sum: "$deductionBreakdown.professionalTax" },
                    totalInsurance: { $sum: "$deductionBreakdown.insurance" },
                    totalDeductions: { $sum: "$totalDeductions" },
                    totalNetSalary: { $sum: "$netSalary" },
                    monthsCount: { $sum: 1 }
                }
            },
            {
                $addFields: {
                    effectiveTaxRate: {
                        $cond: [
                            { $gt: ["$totalGrossSalary", 0] },
                            { $multiply: [{ $divide: ["$totalTax", "$totalGrossSalary"] }, 100] },
                            0
                        ]
                    }
                }
            },
            {
                $sort: {
                    totalTax: -1
                }
            },
            {
                $project: {
                    _id: 0,
                    employee: {
                        id: "$_id.employeeId",
                        name: "$employeeName",
                        employeeId: "$employeeId"
                    },
                    department: {
                        name: "$departmentName",
                        code: "$departmentCode"
                    },
                    year: "$_id.year",
                    totalGrossSalary: 1,
                    totalTax: 1,
                    totalPF: 1,
                    totalProfessionalTax: 1,
                    totalInsurance: 1,
                    totalDeductions: 1,
                    totalNetSalary: 1,
                    effectiveTaxRate: { $round: ["$effectiveTaxRate", 2] },
                    monthsCount: 1
                }
            }
        ]);
        const overallStats = {
            totalTaxCollected: result.reduce((sum, emp) => sum + emp.totalTax, 0),
            totalPFCollected: result.reduce((sum, emp) => sum + emp.totalPF, 0),
            totalEmployees: result.length,
            averageTaxRate: result.length > 0
                ? (result.reduce((sum, emp) => sum + emp.effectiveTaxRate, 0) / result.length).toFixed(2)
                : 0
        };
        res.status(200).json({
            success: true,
            overallStats,
            data: result
        });
    }
    catch (error) {
        console.error("Tax breakdown error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch tax breakdown",
            error: error.message
        });
    }
};
export const getPayrollTrends = async (req, res) => {
    try {
        const { year } = req.query;
        const targetYear = parseInt(year) || new Date().getFullYear();
        const result = await Payroll.aggregate([
            {
                $match: {
                    year: targetYear
                }
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "employee",
                    foreignField: "_id",
                    as: "employeeInfo"
                }
            },
            {
                $unwind: {
                    path: "$employeeInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "departments",
                    localField: "employeeInfo.department",
                    foreignField: "_id",
                    as: "dept"
                }
            },
            {
                $unwind: {
                    path: "$dept",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        month: "$month",
                        departmentId: "$dept._id",
                        departmentName: "$dept.name",
                        departmentCode: "$dept.code"
                    },
                    totalGrossSalary: { $sum: "$grossSalary" },
                    totalNetSalary: { $sum: "$netSalary" },
                    totalEmployees: { $sum: 1 },
                    avgGrossSalary: { $avg: "$grossSalary" },
                    avgNetSalary: { $avg: "$netSalary" }
                }
            },
            {
                $sort: {
                    "_id.month": 1,
                    "_id.departmentName": 1
                }
            },
            {
                $group: {
                    _id: "$_id.departmentId",
                    departmentName: { $first: "$_id.departmentName" },
                    departmentCode: { $first: "$_id.departmentCode" },
                    monthlyData: {
                        $push: {
                            month: "$_id.month",
                            totalGrossSalary: 1,
                            totalNetSalary: 1,
                            totalEmployees: 1,
                            avgGrossSalary: { $round: ["$avgGrossSalary", 2] },
                            avgNetSalary: { $round: ["$avgNetSalary", 2] }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    department: {
                        id: "$_id",
                        name: "$departmentName",
                        code: "$departmentCode"
                    },
                    monthlyData: 1
                }
            }
        ]);
        res.status(200).json({
            success: true,
            year: targetYear,
            data: result
        });
    }
    catch (error) {
        console.error("Payroll trends error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payroll trends",
            error: error.message
        });
    }
};
export const getPayrollComparison = async (req, res) => {
    try {
        const { year } = req.query;
        const targetYear = parseInt(year) || new Date().getFullYear();
        const result = await Payroll.aggregate([
            {
                $match: {
                    year: targetYear
                }
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "employee",
                    foreignField: "_id",
                    as: "employeeInfo"
                }
            },
            {
                $unwind: {
                    path: "$employeeInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$month",
                    month: { $first: "$month" },
                    totalGrossSalary: { $sum: "$grossSalary" },
                    totalNetSalary: { $sum: "$netSalary" },
                    totalEmployees: { $sum: 1 },
                    avgGrossSalary: { $avg: "$grossSalary" },
                    avgNetSalary: { $avg: "$netSalary" },
                    totalTax: { $sum: "$deductionBreakdown.tax" },
                    totalPF: { $sum: "$deductionBreakdown.providentFund" }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    month: 1,
                    monthName: {
                        $let: {
                            vars: {
                                months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
                            },
                            in: { $arrayElemAt: ["$$months", { $subtract: ["$month", 1] }] }
                        }
                    },
                    totalGrossSalary: 1,
                    totalNetSalary: 1,
                    totalEmployees: 1,
                    avgGrossSalary: { $round: ["$avgGrossSalary", 2] },
                    avgNetSalary: { $round: ["$avgNetSalary", 2] },
                    totalTax: 1,
                    totalPF: 1
                }
            }
        ]);
        const enrichedData = result.map((item, index, arr) => {
            const previous = index > 0 ? arr[index - 1] : null;
            const change = previous ? ((item.totalGrossSalary - previous.totalGrossSalary) / previous.totalGrossSalary * 100) : 0;
            return {
                ...item,
                monthOverMonthChange: {
                    percentage: parseFloat(change.toFixed(2)),
                    amount: previous ? item.totalGrossSalary - previous.totalGrossSalary : 0
                }
            };
        });
        res.status(200).json({
            success: true,
            year: targetYear,
            data: enrichedData
        });
    }
    catch (error) {
        console.error("Payroll comparison error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payroll comparison",
            error: error.message
        });
    }
};

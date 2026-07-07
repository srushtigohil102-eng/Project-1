import { Request, Response } from "express";
import { Payroll } from "../models/Payroll";
import { Employee } from "../models/Employee";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ========== EXISTING CRUD FUNCTIONS ==========

// Get all payroll records (with filters)
export const getAllPayrollRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, month, year, employeeId, status } = req.query;
    
    const filter: any = {};
    if (month) filter.month = parseInt(month as string);
    if (year) filter.year = parseInt(year as string);
    if (employeeId) filter.employee = employeeId;
    if (status) filter.status = status;
    
    if (req.user?.role === "Employee") {
      filter.employee = req.user.id;
    }
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const [payrolls, total] = await Promise.all([
      Payroll.find(filter)
        .populate({ path: "employee", select: "firstName lastName email employeeId designation department", populate: { path: "department", select: "name code" } })
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
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payroll records", error: (error as Error).message });
  }
};

// Get payroll by ID
export const getPayrollById = async (req: Request, res: Response): Promise<void> => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate({ path: "employee", select: "firstName lastName email employeeId designation department", populate: { path: "department", select: "name code" } })
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
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payroll record", error: (error as Error).message });
  }
};

// Get payroll by employee
export const getPayrollByEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;
    
    const filter: any = { employee: employeeId };
    if (year) filter.year = parseInt(year as string);
    
    if (req.user?.role === "Employee" && employeeId !== req.user.id) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }
    
    const payrolls = await Payroll.find(filter)
      .populate({ path: "employee", select: "firstName lastName email employeeId department", populate: { path: "department", select: "name code" } })
      .sort({ year: -1, month: -1 });
    
    res.status(200).json({ success: true, data: payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch employee payroll", error: (error as Error).message });
  }
};

// Generate payroll for an employee
export const generatePayroll = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to generate payroll", error: (error as Error).message });
  }
};

// Update payroll record
export const updatePayroll = async (req: Request, res: Response): Promise<void> => {
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
    
    const updatedPayroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?.id },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ success: true, data: updatedPayroll, message: "Payroll updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update payroll", error: (error as Error).message });
  }
};

// Process payment for payroll
export const processPayment = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to process payment", error: (error as Error).message });
  }
};

// Delete payroll record (Admin only)
export const deletePayroll = async (req: Request, res: Response): Promise<void> => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    
    if (!payroll) {
      res.status(404).json({ success: false, message: "Payroll record not found" });
      return;
    }
    
    await payroll.deleteOne();
    
    res.status(200).json({ success: true, message: "Payroll record deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete payroll", error: (error as Error).message });
  }
};

// Get payroll summary
export const getPayrollSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, month } = req.query;
    
    const filter: any = {};
    if (year) filter.year = parseInt(year as string);
    if (month) filter.month = parseInt(month as string);
    
    const payrolls = await Payroll.find(filter).populate("employee", "firstName lastName department");
    
    const summary = {
      totalRecords: payrolls.length,
      totalGrossSalary: payrolls.reduce((sum: number, p: any) => sum + p.grossSalary, 0),
      totalDeductions: payrolls.reduce((sum: number, p: any) => sum + p.totalDeductions, 0),
      totalNetSalary: payrolls.reduce((sum: number, p: any) => sum + p.netSalary, 0),
      paidCount: payrolls.filter((p: any) => p.status === "Paid").length,
      pendingCount: payrolls.filter((p: any) => p.status !== "Paid").length
    };
    
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payroll summary", error: (error as Error).message });
  }
};

// Run payroll for all active employees for the current month
export const runPayroll = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const activeEmployees = await Employee.find({ isActive: true, status: "Active" });

    if (activeEmployees.length === 0) {
      res.status(400).json({ success: false, message: "No active employees found to run payroll" });
      return;
    }

    const created: any[] = [];

    for (const employee of activeEmployees) {
      const existing = await Payroll.findOne({ employee: employee._id, month, year });
      if (existing) continue;

      const basicSalary = employee.salary;
      const hra = basicSalary * 0.4;
      const da = basicSalary * 0.1;
      const ta = basicSalary * 0.08;
      const medicalAllowance = 1250;
      const specialAllowance = basicSalary * 0.15;

      const grossSalary = basicSalary + hra + da + ta + medicalAllowance + specialAllowance;

      const pf = basicSalary * 0.12;
      const professionalTax = basicSalary > 30000 ? 200 : 0;
      const tax = basicSalary > 100000 ? basicSalary * 0.05 : 0;

      const totalDeductions = pf + professionalTax + tax;
      const netSalary = grossSalary - totalDeductions;

      const record = await Payroll.create({
        employee: employee._id,
        month,
        year,
        salaryBreakdown: {
          basic: basicSalary,
          hra,
          da,
          ta,
          medicalAllowance,
          specialAllowance,
        },
        grossSalary,
        deductionBreakdown: {
          tax,
          providentFund: pf,
          professionalTax,
        },
        totalDeductions,
        netSalary,
        presentDays: 26,
        totalWorkingDays: 30,
        status: "Processed",
        generatedBy: req.user?.id,
      });

      created.push(record);
    }

    res.status(201).json({
      success: true,
      data: created,
      message: `Payroll generated for ${created.length} employee(s)`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to run payroll", error: (error as Error).message });
  }
};

// ==================== PAYROLL AGGREGATIONS ====================

// 1. Calculate net pay from basic salary, deductions, and allowances
export const calculateNetPay = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, month, year } = req.query;
    
    const filter: any = {};
    if (employeeId) filter.employee = employeeId;
    if (month) filter.month = parseInt(month as string);
    if (year) filter.year = parseInt(year as string);
    
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
  } catch (error) {
    console.error("Calculate net pay error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to calculate net pay", 
      error: (error as Error).message 
    });
  }
};

// 2. Get employee payroll summary (year-to-date)
export const getEmployeePayrollSummary = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error("Employee payroll summary error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch employee payroll summary", 
      error: (error as Error).message 
    });
  }
};

// 3. Get department-wise payroll statistics
export const getDepartmentPayrollStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, month } = req.query;
    
    const filter: any = {};
    if (year) filter.year = parseInt(year as string);
    if (month) filter.month = parseInt(month as string);
    
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
  } catch (error) {
    console.error("Department payroll stats error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch department payroll statistics", 
      error: (error as Error).message 
    });
  }
};

// 4. Get monthly payroll summary
export const getMonthlyPayrollSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, month } = req.query;
    
    const filter: any = {};
    if (year) filter.year = parseInt(year as string);
    if (month) filter.month = parseInt(month as string);
    
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
  } catch (error) {
    console.error("Monthly payroll summary error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch monthly payroll summary", 
      error: (error as Error).message 
    });
  }
};

// 5. Get top earners
export const getTopEarners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, month, limit = 10 } = req.query;
    
    const filter: any = {};
    if (year) filter.year = parseInt(year as string);
    if (month) filter.month = parseInt(month as string);
    
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
        $limit: parseInt(limit as string)
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
  } catch (error) {
    console.error("Top earners error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch top earners", 
      error: (error as Error).message 
    });
  }
};

// 6. Get tax breakdown
export const getTaxBreakdown = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year } = req.query;
    
    const filter: any = {};
    if (year) filter.year = parseInt(year as string);
    
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
  } catch (error) {
    console.error("Tax breakdown error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch tax breakdown", 
      error: (error as Error).message 
    });
  }
};

// 7. Get payroll trends (month-over-month changes) - ONLY ONE COPY
export const getPayrollTrends = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year } = req.query;
    const targetYear = parseInt(year as string) || new Date().getFullYear();
    
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
  } catch (error) {
    console.error("Payroll trends error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch payroll trends", 
      error: (error as Error).message 
    });
  }
};

// 8. Get payroll comparison between months - ONLY ONE COPY
export const getPayrollComparison = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year } = req.query;
    const targetYear = parseInt(year as string) || new Date().getFullYear();
    
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
    
    // Calculate month-over-month changes
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
  } catch (error) {
    console.error("Payroll comparison error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch payroll comparison", 
      error: (error as Error).message 
    });
  }
};

// ========== DOWNLOAD / PREVIEW ==========

/**
 * Generate and download/preview a payslip PDF for a payroll record.
 * Route param: id — the payroll record's _id
 * Query param: preview=true — set Content-Disposition to inline (opens in browser)
 */
export const downloadPayslip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isPreview = req.query.preview === "true";

    const payroll = await Payroll.findById(id)
      .populate<{ employee: { _id: mongoose.Types.ObjectId; firstName: string; lastName: string; employeeId: string; designation: string; department: { name: string }; panNumber?: string; pfNumber?: string; bankDetails?: { accountNumber?: string; ifscCode?: string; bankName?: string } } }>(
        "employee",
        "firstName lastName employeeId designation department panNumber pfNumber bankDetails"
      )
      .populate("generatedBy", "firstName lastName")
      .populate("approvedBy", "firstName lastName");

    if (!payroll) {
      res.status(404).json({ success: false, message: "Payroll record not found" });
      return;
    }

    const emp = payroll.employee as any;
    const month = payroll.month;
    const year = payroll.year;

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    const filename = `payslip-${emp.employeeId || id}-${MONTH_NAMES[month - 1].toLowerCase()}-${year}.pdf`;
    res.setHeader("Content-Disposition", isPreview ? `inline; filename="${filename}"` : `attachment; filename="${filename}"`);
    doc.pipe(res);

    const pageWidth = doc.page.width - 80;
    const leftMargin = 40;
    const centerX = leftMargin + pageWidth / 2;

    // ── Header ──
    doc.fontSize(20).font("Helvetica-Bold").text("PAYSLIP", centerX, 40, { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica").fillColor("#555555")
      .text(`${MONTH_NAMES[month - 1]} ${year}`, { align: "center" });
    doc.moveDown(0.8);

    // separator
    doc.moveTo(leftMargin, doc.y).lineTo(leftMargin + pageWidth, doc.y).strokeColor("#cccccc").stroke();
    doc.moveDown(0.8);

    // ── Employee Info ──
    const infoY = doc.y;
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#333333").text("Employee Information", leftMargin, infoY);
    doc.moveDown(0.3);

    const infoRows: [string, string][] = [
      ["Employee ID", emp.employeeId || "—"],
      ["Name", `${emp.firstName || ""} ${emp.lastName || ""}`],
      ["Designation", emp.designation || "—"],
      ["Department", emp.department?.name || "—"],
      ["PAN Number", emp.panNumber || "—"],
      ["PF Number", emp.pfNumber || "—"],
    ];

    doc.fontSize(9).font("Helvetica");
    let rowY = doc.y;
    for (const [label, value] of infoRows) {
      doc.fillColor("#888888").text(label, leftMargin, rowY, { width: 120 });
      doc.fillColor("#333333").text(value, leftMargin + 125, rowY, { width: 200 });
      rowY += 14;
    }
    doc.y = rowY;

    // separator
    doc.moveTo(leftMargin, doc.y).lineTo(leftMargin + pageWidth, doc.y).strokeColor("#cccccc").stroke();
    doc.moveDown(0.6);

    // ── Earnings ──
    const earningsY = doc.y;
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#333333").text("Earnings", leftMargin, earningsY);
    doc.moveDown(0.3);

    const sb = payroll.salaryBreakdown;
    const earningsItems: [string, number][] = [
      ["Basic Salary", sb.basic],
      ["House Rent Allowance", sb.hra],
      ["Dearness Allowance", sb.da],
      ["Travel Allowance", sb.ta],
      ["Medical Allowance", sb.medicalAllowance],
      ["Special Allowance", sb.specialAllowance],
    ];
    if (sb.bonus) earningsItems.push(["Bonus", sb.bonus]);
    if (sb.otherEarnings) earningsItems.push(["Other Earnings", sb.otherEarnings]);

    doc.fontSize(9).font("Helvetica");
    let earnY = doc.y;
    for (const [label, amount] of earningsItems) {
      doc.fillColor("#333333").text(label, leftMargin, earnY, { width: 200 });
      doc.fillColor("#333333").text(`₹ ${amount.toLocaleString("en-IN")}`, leftMargin + 250, earnY, { width: 100, align: "right" });
      earnY += 14;
    }
    // Gross total
    earnY += 2;
    doc.moveTo(leftMargin, earnY - 2).lineTo(leftMargin + pageWidth, earnY - 2).strokeColor("#dddddd").stroke();
    doc.font("Helvetica-Bold").fillColor("#222222")
      .text("Gross Salary", leftMargin, earnY, { width: 200 })
      .text(`₹ ${payroll.grossSalary.toLocaleString("en-IN")}`, leftMargin + 250, earnY, { width: 100, align: "right" });
    doc.y = earnY + 18;

    // ── Deductions ──
    doc.moveDown(0.5);
    const dedY = doc.y;
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#333333").text("Deductions", leftMargin, dedY);
    doc.moveDown(0.3);

    const db = payroll.deductionBreakdown;
    const dedItems: [string, number][] = [
      ["Tax (TDS)", db.tax],
      ["Provident Fund", db.providentFund],
      ["Professional Tax", db.professionalTax],
    ];
    if (db.insurance) dedItems.push(["Insurance", db.insurance]);
    if (db.loanDeduction) dedItems.push(["Loan Deduction", db.loanDeduction]);
    if (db.otherDeductions) dedItems.push(["Other Deductions", db.otherDeductions]);

    doc.fontSize(9).font("Helvetica");
    let dedRowY = doc.y;
    for (const [label, amount] of dedItems) {
      doc.fillColor("#333333").text(label, leftMargin, dedRowY, { width: 200 });
      doc.fillColor("#333333").text(`₹ ${amount.toLocaleString("en-IN")}`, leftMargin + 250, dedRowY, { width: 100, align: "right" });
      dedRowY += 14;
    }
    // Deduction total
    dedRowY += 2;
    doc.moveTo(leftMargin, dedRowY - 2).lineTo(leftMargin + pageWidth, dedRowY - 2).strokeColor("#dddddd").stroke();
    doc.font("Helvetica-Bold").fillColor("#222222")
      .text("Total Deductions", leftMargin, dedRowY, { width: 200 })
      .text(`₹ ${payroll.totalDeductions.toLocaleString("en-IN")}`, leftMargin + 250, dedRowY, { width: 100, align: "right" });
    doc.y = dedRowY + 22;

    // ── Net Salary (highlighted) ──
    doc.moveDown(0.5);
    const netY = doc.y;
    doc.rect(leftMargin - 4, netY - 2, pageWidth + 8, 28).fill("#e8f4e8");
    doc.fontSize(13).font("Helvetica-Bold").fillColor("#1a7a1a")
      .text("NET SALARY", leftMargin + 10, netY + 3, { width: 200 });
    doc.fillColor("#1a7a1a")
      .text(`₹ ${payroll.netSalary.toLocaleString("en-IN")}`, leftMargin + 250, netY + 3, { width: 100, align: "right" });
    doc.y = netY + 32;

    // separator
    doc.moveTo(leftMargin, doc.y).lineTo(leftMargin + pageWidth, doc.y).strokeColor("#cccccc").stroke();
    doc.moveDown(0.8);

    // ── Attendance ──
    if (payroll.presentDays != null) {
      doc.fontSize(10).font("Helvetica").fillColor("#555555")
        .text(`Present Days: ${payroll.presentDays} / ${payroll.totalWorkingDays || "—"}`, leftMargin, doc.y, { width: pageWidth / 2 });
    }

    // ── Status & Payment Info ──
    doc.moveDown(0.3);
    const statusY = doc.y;
    doc.fontSize(9).font("Helvetica").fillColor("#888888").text("Status:", leftMargin, statusY, { width: 80 });
    doc.fillColor("#333333").text(payroll.status, leftMargin + 80, statusY, { width: 150 });

    if (payroll.status === "Paid" && payroll.paymentDate) {
      doc.fillColor("#888888").text("Payment Date:", leftMargin + 230, statusY, { width: 100 });
      doc.fillColor("#333333").text(new Date(payroll.paymentDate).toLocaleDateString("en-IN"), leftMargin + 330, statusY, { width: 120 });
    }

    doc.y = statusY + 18;

    if (payroll.paymentMethod) {
      doc.fillColor("#888888").text("Payment Method:", leftMargin, doc.y, { width: 120 });
      doc.fillColor("#333333").text(payroll.paymentMethod, leftMargin + 120, doc.y, { width: 150 });
    }

    // ── Footer ──
    doc.y = doc.page.height - 120;
    doc.moveTo(leftMargin, doc.y).lineTo(leftMargin + pageWidth, doc.y).strokeColor("#cccccc").stroke();
    doc.moveDown(0.3);
    doc.fontSize(7).font("Helvetica").fillColor("#aaaaaa").text(
      "This is a computer-generated payslip. For any discrepancies, please contact HR.",
      leftMargin, doc.y,
      { align: "center", width: pageWidth }
    );

    doc.end();
  } catch (error) {
    console.error("Download payslip error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Failed to generate payslip PDF", error: (error as Error).message });
    }
  }
};
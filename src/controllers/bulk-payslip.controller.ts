import { Request, Response } from "express";
import { Payroll } from "../models/Payroll";
import { Employee } from "../models/Employee";
import { generatePayslipPDF, IPayslipData } from "../utils/pdfGenerator";

// Correct way to import archiver
const archiver = require("archiver");

// Generate bulk payslips for multiple employees
export const generateBulkPayslips = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeIds, month, year } = req.body;

    console.log("Received request:", { employeeIds, month, year });

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "Please provide an array of employee IDs"
      });
      return;
    }

    if (!month || !year) {
      res.status(400).json({
        success: false,
        message: "Month and year are required"
      });
      return;
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    // Get employees
    const employees = await Employee.find({ _id: { $in: employeeIds }, isActive: true });

    if (employees.length === 0) {
      res.status(404).json({
        success: false,
        message: "No active employees found"
      });
      return;
    }

    // Get payrolls for all employees
    const payrolls = await Payroll.find({
      employee: { $in: employeeIds },
      month: parseInt(month as string),
      year: parseInt(year as string)
    }).populate("employee");

    console.log("Found payrolls:", payrolls.length);

    if (payrolls.length === 0) {
      res.status(404).json({
        success: false,
        message: "No payroll records found for the selected employees. Please generate payroll first."
      });
      return;
    }

    // Create ZIP archive
    const archive = archiver("zip", {
      zlib: { level: 9 }
    });

    if (!archive) {
      console.error("Archiver creation failed!");
      res.status(500).json({
        success: false,
        message: "Failed to create ZIP archive"
      });
      return;
    }

    const filename = `Payslips_${monthNames[parseInt(month as string) - 1]}_${year}.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    archive.pipe(res);

    // Generate PDF for each payroll
    for (const payroll of payrolls) {
      const employee = payroll.employee as any;
      
      const payslipData: IPayslipData = {
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employeeId,
        designation: employee.designation,
        department: employee.department ? employee.department.name || "N/A" : "N/A",
        joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString("en-IN") : "N/A",
        panNumber: employee.panNumber || "N/A",
        bankDetails: employee.bankDetails ? {
          accountNumber: employee.bankDetails.accountNumber || "N/A",
          bankName: employee.bankDetails.bankName || "N/A",
          ifscCode: employee.bankDetails.ifscCode || "N/A",
        } : undefined,
        month: monthNames[payroll.month - 1],
        year: payroll.year,
        paymentDate: payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN"),
        payPeriod: `${monthNames[payroll.month - 1]} ${payroll.year}`,
        earnings: [
          { name: "Basic Salary", amount: payroll.salaryBreakdown.basic || 0 },
          { name: "House Rent Allowance (HRA)", amount: payroll.salaryBreakdown.hra || 0 },
          { name: "Dearness Allowance (DA)", amount: payroll.salaryBreakdown.da || 0 },
          { name: "Travel Allowance (TA)", amount: payroll.salaryBreakdown.ta || 0 },
          { name: "Medical Allowance", amount: payroll.salaryBreakdown.medicalAllowance || 0 },
          { name: "Special Allowance", amount: payroll.salaryBreakdown.specialAllowance || 0 },
          ...(payroll.salaryBreakdown.bonus ? [{ name: "Bonus", amount: payroll.salaryBreakdown.bonus }] : []),
          ...(payroll.salaryBreakdown.otherEarnings ? [{ name: "Other Earnings", amount: payroll.salaryBreakdown.otherEarnings }] : [])
        ],
        deductions: [
          { name: "Tax (TDS)", amount: payroll.deductionBreakdown.tax || 0 },
          { name: "Provident Fund (PF)", amount: payroll.deductionBreakdown.providentFund || 0 },
          { name: "Professional Tax", amount: payroll.deductionBreakdown.professionalTax || 0 },
          ...(payroll.deductionBreakdown.insurance ? [{ name: "Insurance", amount: payroll.deductionBreakdown.insurance }] : []),
          ...(payroll.deductionBreakdown.loanDeduction ? [{ name: "Loan Deduction", amount: payroll.deductionBreakdown.loanDeduction }] : [])
        ],
        grossSalary: payroll.grossSalary,
        totalDeductions: payroll.totalDeductions,
        netSalary: payroll.netSalary,
        totalEarnings: payroll.grossSalary,
      };

      const pdfBuffer = await generatePayslipPDF(payslipData);
      const pdfFilename = `Payslip_${employee.employeeId}_${monthNames[payroll.month - 1]}_${payroll.year}.pdf`;
      
      archive.append(pdfBuffer, { name: pdfFilename });
    }

    archive.finalize();

  } catch (error) {
    console.error("Bulk payslip generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate bulk payslips",
      error: (error as Error).message
    });
  }
};

export const generateDepartmentPayslips = async (req: Request, res: Response): Promise<void> => {
  try {
    const { departmentId, month, year } = req.params;

    const employees = await Employee.find({ department: departmentId, isActive: true });

    if (employees.length === 0) {
      res.status(404).json({
        success: false,
        message: "No active employees found in this department"
      });
      return;
    }

    const employeeIds = employees.map(emp => emp._id);

    req.body = {
      employeeIds,
      month: parseInt(month),
      year: parseInt(year)
    };

    await generateBulkPayslips(req, res);
  } catch (error) {
    console.error("Department payslip generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate department payslips",
      error: (error as Error).message
    });
  }
};

export const getAvailableMonths = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;

    const payrolls = await Payroll.find({ employee: employeeId })
      .select("month year")
      .sort({ year: -1, month: -1 });

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    const availableMonths = payrolls.map(p => ({
      month: p.month,
      year: p.year,
      monthName: monthNames[p.month - 1],
      label: `${monthNames[p.month - 1]} ${p.year}`
    }));

    res.status(200).json({
      success: true,
      data: availableMonths
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch available months",
      error: (error as Error).message
    });
  }
};
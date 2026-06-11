import { Request, Response } from "express";
import mongoose from "mongoose";
import { Payroll } from "../models/Payroll";
import { Employee } from "../models/Employee";

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
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payroll records", error: (error as Error).message });
  }
};

// Get payroll by ID
export const getPayrollById = async (req: Request, res: Response): Promise<void> => {
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
      .populate("employee", "firstName lastName email employeeId")
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
    
    // Check if payroll already exists for this employee/month/year
    const existingPayroll = await Payroll.findOne({ employee: employeeId, month, year });
    if (existingPayroll) {
      res.status(400).json({ success: false, message: "Payroll already exists for this month" });
      return;
    }
    
    // Get employee details
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404).json({ success: false, message: "Employee not found" });
      return;
    }
    
    // Calculate salary breakdown if not provided
    const basicSalary = salaryBreakdown?.basic || employee.salary;
    const hra = salaryBreakdown?.hra || basicSalary * 0.4;
    const da = salaryBreakdown?.da || basicSalary * 0.1;
    const ta = salaryBreakdown?.ta || basicSalary * 0.08;
    const medicalAllowance = salaryBreakdown?.medicalAllowance || 1250;
    const specialAllowance = salaryBreakdown?.specialAllowance || basicSalary * 0.15;
    
    const grossSalary = basicSalary + hra + da + ta + medicalAllowance + specialAllowance;
    
    // Calculate deductions
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
      totalGrossSalary: payrolls.reduce((sum, p) => sum + p.grossSalary, 0),
      totalDeductions: payrolls.reduce((sum, p) => sum + p.totalDeductions, 0),
      totalNetSalary: payrolls.reduce((sum, p) => sum + p.netSalary, 0),
      paidCount: payrolls.filter(p => p.status === "Paid").length,
      pendingCount: payrolls.filter(p => p.status !== "Paid").length
    };
    
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch payroll summary", error: (error as Error).message });
  }
};
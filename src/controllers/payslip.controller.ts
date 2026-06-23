import { Request, Response } from 'express';
import { Payroll } from '../models/Payroll';
import { generatePayslipPDF, IPayslipData } from '../utils/pdfGenerator';

// Generate payslip PDF as buffer and stream/download
export const generatePayslip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    // Build filter
    const filter: any = { employee: employeeId };
    if (month) filter.month = parseInt(month as string);
    if (year) filter.year = parseInt(year as string);

    // Get payroll with employee details
    let payroll;
    if (month && year) {
      payroll = await Payroll.findOne(filter)
        .populate('employee')
        .sort({ year: -1, month: -1 });
    } else {
      payroll = await Payroll.findOne({ employee: employeeId })
        .populate('employee')
        .sort({ year: -1, month: -1 });
    }

    if (!payroll) {
      res.status(404).json({ 
        success: false, 
        message: 'Payroll record not found for this employee' 
      });
      return;
    }

    const employee = payroll.employee as any;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];

    // Prepare payslip data
    const payslipData: IPayslipData = {
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeId: employee.employeeId,
      designation: employee.designation,
      department: employee.department ? employee.department.name || 'N/A' : 'N/A',
      joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-IN') : 'N/A',
      panNumber: employee.panNumber || 'N/A',
      bankDetails: employee.bankDetails ? {
        accountNumber: employee.bankDetails.accountNumber || 'N/A',
        bankName: employee.bankDetails.bankName || 'N/A',
        ifscCode: employee.bankDetails.ifscCode || 'N/A',
      } : undefined,
      
      month: monthNames[payroll.month - 1],
      year: payroll.year,
      paymentDate: payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
      payPeriod: `${monthNames[payroll.month - 1]} ${payroll.year}`,
      
      earnings: [
        { name: 'Basic Salary', amount: payroll.salaryBreakdown.basic || 0 },
        { name: 'House Rent Allowance (HRA)', amount: payroll.salaryBreakdown.hra || 0 },
        { name: 'Dearness Allowance (DA)', amount: payroll.salaryBreakdown.da || 0 },
        { name: 'Travel Allowance (TA)', amount: payroll.salaryBreakdown.ta || 0 },
        { name: 'Medical Allowance', amount: payroll.salaryBreakdown.medicalAllowance || 0 },
        { name: 'Special Allowance', amount: payroll.salaryBreakdown.specialAllowance || 0 },
        ...(payroll.salaryBreakdown.bonus ? [{ name: 'Bonus', amount: payroll.salaryBreakdown.bonus }] : []),
        ...(payroll.salaryBreakdown.otherEarnings ? [{ name: 'Other Earnings', amount: payroll.salaryBreakdown.otherEarnings }] : [])
      ],
      deductions: [
        { name: 'Tax (TDS)', amount: payroll.deductionBreakdown.tax || 0 },
        { name: 'Provident Fund (PF)', amount: payroll.deductionBreakdown.providentFund || 0 },
        { name: 'Professional Tax', amount: payroll.deductionBreakdown.professionalTax || 0 },
        ...(payroll.deductionBreakdown.insurance ? [{ name: 'Insurance', amount: payroll.deductionBreakdown.insurance }] : []),
        ...(payroll.deductionBreakdown.loanDeduction ? [{ name: 'Loan Deduction', amount: payroll.deductionBreakdown.loanDeduction }] : [])
      ],
      grossSalary: payroll.grossSalary,
      totalDeductions: payroll.totalDeductions,
      netSalary: payroll.netSalary,
      totalEarnings: payroll.grossSalary,
    };

    // Generate PDF as Buffer
    const pdfBuffer = await generatePayslipPDF(payslipData);

    // Set response headers for streaming/download
    const filename = `Payslip_${employee.employeeId}_${monthNames[payroll.month - 1]}_${payroll.year}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Stream the buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Payslip generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate payslip', 
      error: (error as Error).message 
    });
  }
};

// Get payslip data as JSON (preview before download)
export const getPayslipData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    const filter: any = { employee: employeeId };
    if (month) filter.month = parseInt(month as string);
    if (year) filter.year = parseInt(year as string);

    const payroll = await Payroll.findOne(filter)
      .populate('employee')
      .sort({ year: -1, month: -1 });

    if (!payroll) {
      res.status(404).json({ 
        success: false, 
        message: 'Payroll record not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: payroll
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payslip data', 
      error: (error as Error).message 
    });
  }
};

// Stream payslip for Member A's /payroll/:id/download route
export const downloadPayslip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Payroll ID

    const payroll = await Payroll.findById(id)
      .populate('employee');

    if (!payroll) {
      res.status(404).json({ 
        success: false, 
        message: 'Payroll record not found' 
      });
      return;
    }

    const employee = payroll.employee as any;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];

    const payslipData: IPayslipData = {
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeId: employee.employeeId,
      designation: employee.designation,
      department: employee.department ? employee.department.name || 'N/A' : 'N/A',
      joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-IN') : 'N/A',
      panNumber: employee.panNumber || 'N/A',
      bankDetails: employee.bankDetails ? {
        accountNumber: employee.bankDetails.accountNumber || 'N/A',
        bankName: employee.bankDetails.bankName || 'N/A',
        ifscCode: employee.bankDetails.ifscCode || 'N/A',
      } : undefined,
      
      month: monthNames[payroll.month - 1],
      year: payroll.year,
      paymentDate: payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
      payPeriod: `${monthNames[payroll.month - 1]} ${payroll.year}`,
      
      earnings: [
        { name: 'Basic Salary', amount: payroll.salaryBreakdown.basic || 0 },
        { name: 'House Rent Allowance (HRA)', amount: payroll.salaryBreakdown.hra || 0 },
        { name: 'Dearness Allowance (DA)', amount: payroll.salaryBreakdown.da || 0 },
        { name: 'Travel Allowance (TA)', amount: payroll.salaryBreakdown.ta || 0 },
        { name: 'Medical Allowance', amount: payroll.salaryBreakdown.medicalAllowance || 0 },
        { name: 'Special Allowance', amount: payroll.salaryBreakdown.specialAllowance || 0 },
        ...(payroll.salaryBreakdown.bonus ? [{ name: 'Bonus', amount: payroll.salaryBreakdown.bonus }] : []),
        ...(payroll.salaryBreakdown.otherEarnings ? [{ name: 'Other Earnings', amount: payroll.salaryBreakdown.otherEarnings }] : [])
      ],
      deductions: [
        { name: 'Tax (TDS)', amount: payroll.deductionBreakdown.tax || 0 },
        { name: 'Provident Fund (PF)', amount: payroll.deductionBreakdown.providentFund || 0 },
        { name: 'Professional Tax', amount: payroll.deductionBreakdown.professionalTax || 0 },
        ...(payroll.deductionBreakdown.insurance ? [{ name: 'Insurance', amount: payroll.deductionBreakdown.insurance }] : []),
        ...(payroll.deductionBreakdown.loanDeduction ? [{ name: 'Loan Deduction', amount: payroll.deductionBreakdown.loanDeduction }] : [])
      ],
      grossSalary: payroll.grossSalary,
      totalDeductions: payroll.totalDeductions,
      netSalary: payroll.netSalary,
      totalEarnings: payroll.grossSalary,
    };

    const pdfBuffer = await generatePayslipPDF(payslipData);

    const filename = `Payslip_${employee.employeeId}_${monthNames[payroll.month - 1]}_${payroll.year}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download payslip error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to download payslip', 
      error: (error as Error).message 
    });
  }
};
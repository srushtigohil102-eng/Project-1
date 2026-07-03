import type { Request, Response } from "express";
import PDFDocument from "pdfkit";

/**
 * Security Improvements
 * - Input validation
 * - Standardized API responses
 * - Error handling
 */

interface Payroll {
  employeeId: string;
  employeeName: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
}

const payrollData: Payroll[] = [
  {
    employeeId: "emp-001",
    employeeName: "John Employee",
    basicSalary: 50000,
    allowances: 5000,
    deductions: 2000,
  },
  {
    employeeId: "emp-002",
    employeeName: "Priya Sharma",
    basicSalary: 60000,
    allowances: 6000,
    deductions: 3000,
  },
];

export const getPayrollByEmployeeId = (
  req: Request,
  res: Response
): void => {
  try {
    const employeeId = String(req.params.employeeId ?? "");

    if (employeeId.trim() === "") {
      res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
      return;
    }

    const payroll = payrollData.find(
      (item) => item.employeeId === employeeId
    );

    if (!payroll) {
      res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
      return;
    }

    const netSalary =
      payroll.basicSalary +
      payroll.allowances -
      payroll.deductions;

    res.status(200).json({
      success: true,
      data: {
        employeeId: payroll.employeeId,
        employeeName: payroll.employeeName,
        basicSalary: payroll.basicSalary,
        allowances: payroll.allowances,
        deductions: payroll.deductions,
        netSalary,
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const runPayroll = (
  _req: Request,
  res: Response
): void => {
  try {
    if (payrollData.length === 0) {
      res.status(400).json({
        success: false,
        message: "No payroll records available",
      });
      return;
    }

    const payrollSummary = payrollData.map((payroll) => ({
      employeeId: payroll.employeeId,
      employeeName: payroll.employeeName,
      basicSalary: payroll.basicSalary,
      allowances: payroll.allowances,
      deductions: payroll.deductions,
      netSalary:
        payroll.basicSalary +
        payroll.allowances -
        payroll.deductions,
    }));

    res.status(200).json({
      success: true,
      message: "Payroll processed successfully",
      totalEmployees: payrollSummary.length,
      data: payrollSummary,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const downloadPayrollPdf = (
  req: Request,
  res: Response
): void => {
  try {
    const employeeId = String(req.params.employeeId ?? "");

    if (employeeId.trim() === "") {
      res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
      return;
    }

    const payroll = payrollData.find(
      (item) => item.employeeId === employeeId
    );

    if (!payroll) {
      res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
      return;
    }

    const netSalary =
      payroll.basicSalary +
      payroll.allowances -
      payroll.deductions;

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${employeeId}-payroll.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Payroll Report", {
      align: "center",
    });

    doc.moveDown();

    doc.text(`Employee ID: ${payroll.employeeId}`);
    doc.text(`Employee Name: ${payroll.employeeName}`);
    doc.text(`Basic Salary: ₹${payroll.basicSalary}`);
    doc.text(`Allowances: ₹${payroll.allowances}`);
    doc.text(`Deductions: ₹${payroll.deductions}`);
    doc.text(`Net Salary: ₹${netSalary}`);

    doc.end();
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
import type { Request, Response } from "express";
import PDFDocument from "pdfkit";

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
  const payroll = payrollData.find(
    (item) => item.employeeId === req.params.employeeId
  );

  if (!payroll) {
    res.status(404).json({
      message: "Payroll record not found",
    });
    return;
  }

  const netSalary =
    payroll.basicSalary +
    payroll.allowances -
    payroll.deductions;

  res.status(200).json({
    employeeId: payroll.employeeId,
    employeeName: payroll.employeeName,
    basicSalary: payroll.basicSalary,
    allowances: payroll.allowances,
    deductions: payroll.deductions,
    netSalary,
  });
};

export const runPayroll = (
  _req: Request,
  res: Response
): void => {
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
    message: "Payroll processed successfully",
    totalEmployees: payrollSummary.length,
    payrollSummary,
  });
};

export const downloadPayrollPdf = (
  req: Request,
  res: Response
): void => {
  const payroll = payrollData.find(
    (item) => item.employeeId === req.params.employeeId
  );

  if (!payroll) {
    res.status(404).json({
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
    `attachment; filename=${payroll.employeeId}-payroll.pdf`
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
};
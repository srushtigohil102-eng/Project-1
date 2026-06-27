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

import type { AuthenticatedRequest } from "../middleware/authMiddleware";

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const payrollRecords: PayrollRecord[] = [
  {
    id: "pay-001",
    employeeId: "emp-001",
    employeeName: "John Employee",
    month: "June",
    year: 2026,
    basicSalary: 75000,
    allowances: 10000,
    deductions: 5000,
    netPay: 80000,
  },
  {
    id: "pay-002",
    employeeId: "emp-002",
    employeeName: "Priya Sharma",
    month: "June",
    year: 2026,
    basicSalary: 62000,
    allowances: 8000,
    deductions: 4000,
    netPay: 66000,
  },
  {
    id: "pay-003",
    employeeId: "emp-003",
    employeeName: "Rahul Mehta",
    month: "June",
    year: 2026,
    basicSalary: 68000,
    allowances: 9000,
    deductions: 4500,
    netPay: 72500,
  },
  {
    id: "pay-004",
    employeeId: "emp-004",
    employeeName: "Anita Desai",
    month: "June",
    year: 2026,
    basicSalary: 71000,
    allowances: 8500,
    deductions: 4200,
    netPay: 75300,
  },
  {
    id: "pay-005",
    employeeId: "emp-005",
    employeeName: "Vikram Singh",
    month: "June",
    year: 2026,
    basicSalary: 58000,
    allowances: 7000,
    deductions: 3500,
    netPay: 61500,
  },
  {
    id: "pay-006",
    employeeId: "emp-006",
    employeeName: "Sneha Patel",
    month: "June",
    year: 2026,
    basicSalary: 65000,
    allowances: 7500,
    deductions: 3800,
    netPay: 68700,
  },
];

export const getPayroll = (_req: Request, res: Response): void => {
  res.status(200).json(payrollRecords);
};

export const getPayrollByEmployee = (req: Request, res: Response): void => {
  const { id } = req.params;
  const records = payrollRecords.filter((r) => r.employeeId === id);
  res.status(200).json(records);
};

export const runPayroll = (_req: Request, res: Response): void => {
  const now = new Date();
  const monthName = MONTH_NAMES[now.getMonth()];
  const year = now.getFullYear();

  // Check if payroll already exists for this month
  const existing = payrollRecords.some(
    (r) => r.month === monthName && r.year === year
  );

  if (existing) {
    res.status(200).json(
      payrollRecords.filter((r) => r.month === monthName && r.year === year)
    );
    return;
  }

  // Generate payroll for all mock employees
  const mockEmployees = [
    { id: "emp-001", name: "John Employee", basic: 75000, allowances: 10000 },
    { id: "emp-002", name: "Priya Sharma", basic: 62000, allowances: 8000 },
    { id: "emp-003", name: "Rahul Mehta", basic: 68000, allowances: 9000 },
    { id: "emp-004", name: "Anita Desai", basic: 71000, allowances: 8500 },
    { id: "emp-005", name: "Vikram Singh", basic: 58000, allowances: 7000 },
    { id: "emp-006", name: "Sneha Patel", basic: 65000, allowances: 7500 },
  ];

  const newRecords: PayrollRecord[] = mockEmployees.map((emp) => {
    const deductions = Math.round(emp.basic * 0.06);
    const netPay = emp.basic + emp.allowances - deductions;
    return {
      id: `pay-${Date.now()}-${emp.id}`,
      employeeId: emp.id,
      employeeName: emp.name,
      month: monthName,
      year,
      basicSalary: emp.basic,
      allowances: emp.allowances,
      deductions,
      netPay,
    };
  });

  payrollRecords.push(...newRecords);

  res.status(201).json(newRecords);
};


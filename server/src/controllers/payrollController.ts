import type { Request, Response } from "express";
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

import type { Request, Response } from "express";

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
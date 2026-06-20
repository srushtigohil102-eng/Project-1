import type { Request, Response } from "express";

const payrollData = [
  {
    employeeId: "emp-001",
    employeeName: "John Employee",
    basicSalary: 50000,
    allowances: 5000,
    deductions: 2000,
    netSalary: 53000,
  },
  {
    employeeId: "emp-002",
    employeeName: "Priya Sharma",
    basicSalary: 60000,
    allowances: 6000,
    deductions: 3000,
    netSalary: 63000,
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

  res.status(200).json(payroll);
};
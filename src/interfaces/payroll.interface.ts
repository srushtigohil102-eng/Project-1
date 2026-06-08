import { Types } from "mongoose";

export interface IPayroll {
  employee: Types.ObjectId;

  basicSalary: number;

  allowances: number;

  deductions: number;

  netSalary: number;

  month: number; // 1-12

  year: number;

  paymentDate?: Date;

  status:
    | "Pending"
    | "Paid";
}
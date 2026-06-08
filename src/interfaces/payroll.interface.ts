import { Document, Types } from "mongoose";

export type PayrollStatus = "Draft" | "Processed" | "Paid" | "Cancelled";
export type PaymentMethod = "Bank Transfer" | "Cheque" | "Cash";
export type SalaryMonth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface ISalaryBreakdown {
  basic: number;
  hra: number;           // House Rent Allowance
  da: number;            // Dearness Allowance
  ta: number;            // Travel Allowance
  medicalAllowance: number;
  specialAllowance: number;
  bonus?: number;
  otherEarnings?: number;
}

export interface IDeductionBreakdown {
  tax: number;           // TDS
  providentFund: number; // PF
  professionalTax: number;
  loanDeduction?: number;
  insurance?: number;
  otherDeductions?: number;
}

export interface IPayroll extends Document {
  employee: Types.ObjectId;
  month: SalaryMonth;
  year: number;
  
  // Salary Components
  salaryBreakdown: ISalaryBreakdown;
  grossSalary: number;
  deductionBreakdown: IDeductionBreakdown;
  totalDeductions: number;
  netSalary: number;
  
  // Attendance Related
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  holidayDays: number;
  overtimeHours?: number;
  overtimeAmount?: number;
  
  // Bonus & Adjustments
  performanceBonus?: number;
  festivalBonus?: number;
  arrears?: number;
  adjustment?: number;
  adjustmentReason?: string;
  
  // Payment Details
  paymentDate?: Date;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  bankReference?: string;
  
  // Status & Approval
  status: PayrollStatus;
  generatedBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  
  // Documents
  salarySlipUrl?: string;
  notes?: string;
  
  // System Fields
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  calculateGrossSalary(): number;
  calculateNetSalary(): number;
}

export interface ICreatePayroll {
  employee: string;
  month: SalaryMonth;
  year: number;
  salaryBreakdown: ISalaryBreakdown;
  deductionBreakdown: IDeductionBreakdown;
  totalWorkingDays?: number;
  presentDays?: number;
  absentDays?: number;
  leaveDays?: number;
  performanceBonus?: number;
  festivalBonus?: number;
  arrears?: number;
}

export interface IUpdatePayroll {
  salaryBreakdown?: Partial<ISalaryBreakdown>;
  deductionBreakdown?: Partial<IDeductionBreakdown>;
  presentDays?: number;
  absentDays?: number;
  leaveDays?: number;
  performanceBonus?: number;
  festivalBonus?: number;
  adjustment?: number;
  adjustmentReason?: string;
  status?: PayrollStatus;
  paymentDate?: Date;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  notes?: string;
}

export interface IPayslip {
  payrollId: string;
  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  month: string;
  year: number;
  earnings: Array<{ name: string; amount: number }>;
  deductions: Array<{ name: string; amount: number }>;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  amountInWords: string;
  paymentDate: Date;
}
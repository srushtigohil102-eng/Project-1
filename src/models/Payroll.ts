import { Schema, model } from "mongoose";
import { IPayroll } from "../interfaces/payroll.interface";

const SalaryBreakdownSchema = new Schema({
  basic: { type: Number, required: true, min: 0 },
  hra: { type: Number, default: 0, min: 0 },
  da: { type: Number, default: 0, min: 0 },
  ta: { type: Number, default: 0, min: 0 },
  medicalAllowance: { type: Number, default: 0, min: 0 },
  specialAllowance: { type: Number, default: 0, min: 0 },
  bonus: { type: Number, default: 0, min: 0 },
  otherEarnings: { type: Number, default: 0, min: 0 },
});

const DeductionBreakdownSchema = new Schema({
  tax: { type: Number, default: 0, min: 0 },
  providentFund: { type: Number, default: 0, min: 0 },
  professionalTax: { type: Number, default: 0, min: 0 },
  loanDeduction: { type: Number, default: 0, min: 0 },
  insurance: { type: Number, default: 0, min: 0 },
  otherDeductions: { type: Number, default: 0, min: 0 },
});

const PayrollSchema = new Schema<IPayroll>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    salaryBreakdown: { type: SalaryBreakdownSchema, required: true },
    grossSalary: { type: Number, required: true, min: 0, default: 0 },
    deductionBreakdown: { type: DeductionBreakdownSchema, required: true },
    totalDeductions: { type: Number, required: true, min: 0, default: 0 },
    netSalary: { type: Number, required: true, min: 0, default: 0 },
    totalWorkingDays: { type: Number, default: 30 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    holidayDays: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    overtimeAmount: { type: Number, default: 0 },
    performanceBonus: { type: Number, default: 0 },
    festivalBonus: { type: Number, default: 0 },
    arrears: { type: Number, default: 0 },
    adjustment: { type: Number, default: 0 },
    adjustmentReason: { type: String, trim: true },
    paymentDate: { type: Date },
    paymentMethod: { type: String, enum: ["Bank Transfer", "Cheque", "Cash"] },
    transactionId: { type: String, trim: true },
    bankReference: { type: String, trim: true },
    status: { type: String, enum: ["Draft", "Processed", "Paid", "Cancelled"], default: "Draft" },
    generatedBy: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "Employee" },
    approvedAt: { type: Date },
    salarySlipUrl: { type: String },
    notes: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes
PayrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export const Payroll = model<IPayroll>("Payroll", PayrollSchema);
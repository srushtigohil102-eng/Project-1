import { Document, Types } from "mongoose";

export type LeaveType = "Sick" | "Casual" | "Annual" | "Maternity" | "Paternity" | "Unpaid" | "Bereavement" | "Study";
export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";
export type HalfDayType = "First Half" | "Second Half";

export interface ILeaveRequest extends Document {
  employee: Types.ObjectId;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  isHalfDay?: boolean;
  halfDayType?: HalfDayType;
  numberOfDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  appliedAt: Date;
  attachment?: string;
  notifiedTo?: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  calculateDays(): number;
}

export interface ICreateLeaveRequest {
  employee: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  isHalfDay?: boolean;
  halfDayType?: HalfDayType;
  reason: string;
  attachment?: string;
}

export interface IUpdateLeaveRequest {
  leaveType?: LeaveType;
  startDate?: Date;
  endDate?: Date;
  reason?: string;
  status?: LeaveStatus;
  rejectionReason?: string;
}

export interface ILeaveBalance {
  employee: Types.ObjectId;
  year: number;
  sick: number;
  casual: number;
  annual: number;
  maternity: number;
  paternity: number;
  bereavement: number;
  study: number;
  used: {
    sick: number;
    casual: number;
    annual: number;
    maternity: number;
    paternity: number;
    bereavement: number;
    study: number;
  };
  carriedForward: {
    sick: number;
    casual: number;
    annual: number;
  };
}
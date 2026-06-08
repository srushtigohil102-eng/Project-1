import { Types } from "mongoose";

export interface ILeaveRequest {
  employee: Types.ObjectId;

  leaveType:
    | "Sick"
    | "Casual"
    | "Annual"
    | "Maternity"
    | "Paternity"
    | "Unpaid";

  startDate: Date;

  endDate: Date;

  reason: string;

  status:
    | "Pending"
    | "Approved"
    | "Rejected";

  approvedBy?: Types.ObjectId;

  appliedAt: Date;
}
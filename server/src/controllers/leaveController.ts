import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  rejectReason?: string;
}

const leaveRequests: LeaveRequest[] = [
  {
    id: "leave-001",
    employeeId: "demo-emp-1",
    employeeName: "Rahul Sharma",
    leaveType: "Annual",
    fromDate: "2026-06-22",
    toDate: "2026-06-26",
    reason: "Family vacation",
    status: "approved",
    createdAt: "2026-06-10T10:00:00Z",
  },
  {
    id: "leave-002",
    employeeId: "demo-emp-3",
    employeeName: "Anita Desai",
    leaveType: "Sick",
    fromDate: "2026-06-18",
    toDate: "2026-06-19",
    reason: "Medical appointment",
    status: "pending",
    createdAt: "2026-06-17T08:30:00Z",
  },
  {
    id: "leave-003",
    employeeId: "demo-emp-1",
    employeeName: "Rahul Sharma",
    leaveType: "Personal",
    fromDate: "2026-07-01",
    toDate: "2026-07-01",
    reason: "Personal errand",
    status: "pending",
    createdAt: "2026-06-19T14:00:00Z",
  },
];

export const getLeaves = (_req: Request, res: Response): void => {
  res.status(200).json(leaveRequests);
};

export const applyLeave = (req: Request, res: Response): void => {
  const user = (req as AuthenticatedRequest).user;
  const { leaveType, fromDate, toDate, reason } = req.body;

  const leaveRequest: LeaveRequest = {
    id: `leave-${Date.now()}`,
    employeeId: user?.id ?? "",
    employeeName: user?.email ?? "",
    leaveType: leaveType ?? "",
    fromDate: fromDate ?? "",
    toDate: toDate ?? "",
    reason: reason ?? "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  leaveRequests.push(leaveRequest);

  res.status(201).json({
    message: "Leave request submitted successfully",
    leaveRequest,
  });
};

export const approveLeave = (req: Request, res: Response): void => {
  const leave = leaveRequests.find(
    (item) => item.id === req.params.id
  );

  if (!leave) {
    res.status(404).json({
      message: "Leave request not found",
    });
    return;
  }

  leave.status = "approved";

  res.status(200).json({
    message: "Leave approved successfully",
    leave,
  });
};

export const rejectLeave = (req: Request, res: Response): void => {
  const leave = leaveRequests.find(
    (item) => item.id === req.params.id
  );

  if (!leave) {
    res.status(404).json({
      message: "Leave request not found",
    });
    return;
  }

  const { reason } = req.body;
  leave.status = "rejected";
  leave.rejectReason = reason ?? "";

  res.status(200).json({
    message: "Leave rejected successfully",
    leave,
  });
};

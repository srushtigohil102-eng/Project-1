import type { Request, Response } from "express";

interface LeaveRequest {
  id: string;
  employeeId: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

const leaveRequests: LeaveRequest[] = [];

export const applyLeave = (req: Request, res: Response): void => {
  const { employeeId, reason } = req.body;

  const leaveRequest: LeaveRequest = {
    id: `leave-${Date.now()}`,
    employeeId,
    reason,
    status: "pending",
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

  leave.status = "rejected";

  res.status(200).json({
    message: "Leave rejected successfully",
    leave,
  });
};
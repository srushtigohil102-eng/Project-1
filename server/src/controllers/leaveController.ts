import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

/**
 * Leave Controller
 * Handles Leave Management APIs
 */

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

/**
 * GET /leave
 * Returns all leave requests.
 */
export const getLeaves = (_req: Request, res: Response): void => {
  try {
    res.status(200).json({
      success: true,
      data: leaveRequests,
    });
  } catch (error) {
    console.error("Get Leaves Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * POST /leave/apply
 * Employee applies for leave.
 */
export const applyLeave = (req: Request, res: Response): void => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { leaveType, fromDate, toDate, reason } = req.body;

    if (!leaveType || !fromDate || !toDate || !reason) {
      res.status(400).json({
        success: false,
        message: "All leave fields are required",
      });
      return;
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    if (endDate < startDate) {
      res.status(400).json({
        success: false,
        message: "To date cannot be before From date",
      });
      return;
    }

    const leaveRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: user?.id ?? "",
      employeeName: user?.email ?? "",
      leaveType,
      fromDate,
      toDate,
      reason,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    leaveRequests.push(leaveRequest);

    res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      data: leaveRequest,
    });
  } catch (error) {
    console.error("Apply Leave Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * PUT /leave/:id/approve
 * Approves a leave request.
 */
export const approveLeave = (req: Request, res: Response): void => {
  try {
    const leave = leaveRequests.find(
      (item) => item.id === req.params.id
    );

    if (!leave) {
      res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
      return;
    }

    leave.status = "approved";

    res.status(200).json({
      success: true,
      message: "Leave approved successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Approve Leave Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * PUT /leave/:id/reject
 * Rejects a leave request.
 */
export const rejectLeave = (req: Request, res: Response): void => {
  try {
    const leave = leaveRequests.find(
      (item) => item.id === req.params.id
    );

    if (!leave) {
      res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
      return;
    }

    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
      return;
    }

    leave.status = "rejected";
    leave.rejectReason = reason;

    res.status(200).json({
      success: true,
      message: "Leave rejected successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Reject Leave Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
import { Router } from "express";
import {
  getAllLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  processLeaveRequest,
  cancelLeaveRequest,
  getLeaveBalance
} from "../controllers/leave.controller";
import { verifyTokenMiddleware } from "../middleware/auth.middleware";
import { requireManager } from "../middleware/role.middleware";

const router = Router();

router.use(verifyTokenMiddleware);

// Employee routes
router.post("/", createLeaveRequest);
router.put("/:id", updateLeaveRequest);
router.delete("/:id/cancel", cancelLeaveRequest);
router.get("/balance", getLeaveBalance);
router.get("/balance/:employeeId", requireManager, getLeaveBalance);

// Manager/HR routes
router.get("/", requireManager, getAllLeaveRequests);
router.get("/:id", requireManager, getLeaveRequestById);
router.put("/:id/process", requireManager, processLeaveRequest);

export default router;
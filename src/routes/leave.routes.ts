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
router.post("/apply", createLeaveRequest);
router.put("/:id", updateLeaveRequest);
router.delete("/:id/cancel", cancelLeaveRequest);
router.get("/balance", getLeaveBalance);
router.get("/balance/:employeeId", requireManager, getLeaveBalance);

// All authenticated users can access their leaves
router.get("/", verifyTokenMiddleware, getAllLeaveRequests);
router.get("/:id", requireManager, getLeaveRequestById);
router.put("/:id/process", requireManager, processLeaveRequest);
router.put("/:id/approve", requireManager, async (req, res) => {
  req.body = { status: "Approved" };
  await processLeaveRequest(req, res);
});
router.put("/:id/reject", requireManager, async (req, res) => {
  req.body = { status: "Rejected", rejectionReason: req.body.reason };
  await processLeaveRequest(req, res);
});

export default router;
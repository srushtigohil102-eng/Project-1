import express from "express";
import {
  applyLeave,
  approveLeave,
  rejectLeave,
} from "../controllers/leaveController";
import { verifyToken, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

// Employee can apply for leave
router.post(
  "/apply",
  verifyToken,
  requireRole("employee"),
  applyLeave
);

// HR Manager can approve leave
router.put(
  "/:id/approve",
  verifyToken,
  requireRole("hr_manager"),
  approveLeave
);

// HR Manager can reject leave
router.put(
  "/:id/reject",
  verifyToken,
  requireRole("hr_manager"),
  rejectLeave
);

export default router;
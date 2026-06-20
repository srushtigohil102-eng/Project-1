import express from "express";
import { getPayrollByEmployeeId } from "../controllers/payrollController";
import { verifyToken, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

router.get(
  "/:employeeId",
  verifyToken,
  requireRole("hr_manager"),
  getPayrollByEmployeeId
);

export default router;
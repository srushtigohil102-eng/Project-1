import express from "express";
import {
  getPayroll,
  getPayrollByEmployee,
  runPayroll,
} from "../controllers/payrollController";
import { verifyToken, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

// Both roles can view payroll records
router.get(
  "/",
  verifyToken,
  getPayroll
);

// View payroll for a specific employee
router.get(
  "/:id",
  verifyToken,
  getPayrollByEmployee
);

// HR Manager can run payroll
router.post(
  "/run",
  verifyToken,
  requireRole("hr_manager"),
  runPayroll
);

export default router;

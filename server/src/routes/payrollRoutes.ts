import express from "express";
import {

  getPayrollByEmployeeId,
  runPayroll,
  downloadPayrollPdf,

  getPayroll,
  getPayrollByEmployee,
  runPayroll,

} from "../controllers/payrollController";
import { verifyToken, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

router.get(
  "/:employeeId",
  verifyToken,
  requireRole("hr_manager"),
  getPayrollByEmployeeId
);

router.post(
  "/run",
  verifyToken,
  requireRole("hr_manager"),
  runPayroll
);

router.get(
  "/:employeeId/download",
  verifyToken,
  requireRole("hr_manager"),
  downloadPayrollPdf
);

export default router;

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


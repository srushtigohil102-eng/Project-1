import express from "express";
import {
  getPayroll,
  getPayrollByEmployee,
  getPayrollByEmployeeId,
  runPayroll,
  downloadPayrollPdf,
} from "../controllers/payrollController";
import { verifyToken, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

// View all payroll records
router.get(
  "/",
  verifyToken,
  getPayroll
);

// View payroll by employee ID
router.get(
  "/employee/:employeeId",
  verifyToken,
  requireRole("hr_manager"),
  getPayrollByEmployeeId
);

// View payroll using id (existing route from latest project)
router.get(
  "/:id",
  verifyToken,
  getPayrollByEmployee
);

// Run payroll
router.post(
  "/run",
  verifyToken,
  requireRole("hr_manager"),
  runPayroll
);

// Download payroll PDF
router.get(
  "/employee/:employeeId/download",
  verifyToken,
  requireRole("hr_manager"),
  downloadPayrollPdf
);

export default router;
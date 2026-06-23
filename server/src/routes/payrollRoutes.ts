import express from "express";
import {
  getPayrollByEmployeeId,
  runPayroll,
  downloadPayrollPdf,
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
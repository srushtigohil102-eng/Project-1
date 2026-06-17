import { Router } from "express";
import {
  getAllPayrollRecords,
  getPayrollById,
  getPayrollByEmployee,
  generatePayroll,
  updatePayroll,
  processPayment,
  deletePayroll,
  getPayrollSummary,
  calculateNetPay,
  getEmployeePayrollSummary,
  getDepartmentPayrollStats,
  getMonthlyPayrollSummary,
  getTopEarners
} from "../controllers/payroll.controller";
import { verifyTokenMiddleware } from "../middleware/auth.middleware";
import { requireAdmin, requireHR, requireManager } from "../middleware/role.middleware";

const router = Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

// 1. Employee payroll routes
router.get("/employee/:employeeId", getPayrollByEmployee);

// 2. ALL aggregation routes - SPECIFIC PATHS
router.get("/calculate-net-pay", requireManager, calculateNetPay);
router.get("/employee-summary/:employeeId", requireManager, getEmployeePayrollSummary);
router.get("/department-stats", requireManager, getDepartmentPayrollStats);
router.get("/monthly-summary", requireManager, getMonthlyPayrollSummary);
router.get("/top-earners", requireManager, getTopEarners);
router.get("/summary", requireManager, getPayrollSummary);


router.get("/", requireManager, getAllPayrollRecords);
router.get("/:id", requireManager, getPayrollById);

// ========== POST/PUT/DELETE ROUTES ==========

// Generate payroll (HR only)
router.post("/generate", requireHR, generatePayroll);

// Update payroll (HR only)
router.put("/:id", requireHR, updatePayroll);
router.put("/:id/payment", requireHR, processPayment);


router.delete("/:id", requireAdmin, deletePayroll);

export default router;
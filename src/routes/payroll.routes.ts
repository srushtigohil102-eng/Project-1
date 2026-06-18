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
  getTopEarners,
  getTaxBreakdown,
  getPayrollTrends,
  getPayrollComparison
} from "../controllers/payroll.controller";
import { verifyTokenMiddleware } from "../middleware/auth.middleware";
import { requireAdmin, requireHR, requireManager } from "../middleware/role.middleware";

const router = Router();

router.use(verifyTokenMiddleware);

// ========== PAYROLL AGGREGATION ROUTES (SPECIFIC PATHS FIRST) ==========
router.get("/calculate-net-pay", requireManager, calculateNetPay);
router.get("/employee-summary/:employeeId", requireManager, getEmployeePayrollSummary);
router.get("/department-stats", requireManager, getDepartmentPayrollStats);
router.get("/monthly-summary", requireManager, getMonthlyPayrollSummary);
router.get("/top-earners", requireManager, getTopEarners);
router.get("/tax-breakdown", requireManager, getTaxBreakdown);
router.get("/trends", requireManager, getPayrollTrends);
router.get("/comparison", requireManager, getPayrollComparison);
router.get("/summary", requireManager, getPayrollSummary);

// ========== BASIC CRUD ROUTES ==========
router.get("/employee/:employeeId", getPayrollByEmployee);
router.get("/", requireManager, getAllPayrollRecords);
router.get("/:id", requireManager, getPayrollById);

// ========== POST/PUT/DELETE ROUTES ==========
router.post("/generate", requireHR, generatePayroll);
router.put("/:id", requireHR, updatePayroll);
router.put("/:id/payment", requireHR, processPayment);
router.delete("/:id", requireAdmin, deletePayroll);

export default router;
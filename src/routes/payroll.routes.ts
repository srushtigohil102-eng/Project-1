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

// All routes require authentication
router.use(verifyTokenMiddleware);

// ========== SPECIFIC ROUTES - MUST COME FIRST! ==========

// Employee routes
router.get("/employee/:employeeId", getPayrollByEmployee);

// ALL aggregation routes - SPECIFIC PATHS
router.get("/calculate-net-pay", requireManager, calculateNetPay);
router.get("/employee-summary/:employeeId", requireManager, getEmployeePayrollSummary);
router.get("/department-stats", requireManager, getDepartmentPayrollStats);
router.get("/monthly-summary", requireManager, getMonthlyPayrollSummary);
router.get("/top-earners", requireManager, getTopEarners);
router.get("/tax-breakdown", requireManager, getTaxBreakdown);
router.get("/trends", requireManager, getPayrollTrends);
router.get("/comparison", requireManager, getPayrollComparison);
router.get("/summary", requireManager, getPayrollSummary);

// GET all payrolls
router.get("/", requireManager, getAllPayrollRecords);

// ========== PARAMETER ROUTE - MUST BE LAST! ==========

// Get payroll by ID - MUST BE THE VERY LAST GET ROUTE!
router.get("/:id", requireManager, getPayrollById);

// ========== POST/PUT/DELETE ROUTES ==========

router.post("/generate", requireHR, generatePayroll);
router.put("/:id", requireHR, updatePayroll);
router.put("/:id/payment", requireHR, processPayment);
router.delete("/:id", requireAdmin, deletePayroll);

router.get("/trends", getPayrollTrends);
router.get("/comparison", getPayrollComparison);

export default router;
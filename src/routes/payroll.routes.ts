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
  // getPayrollComparison removed: not exported from controller
} from "../controllers/payroll.controller";
import { verifyTokenMiddleware } from "../middleware/auth.middleware";
import { requireAdmin, requireHR, requireManager } from "../middleware/role.middleware";

const router = Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

// ========== SPECIFIC ROUTES (MUST COME FIRST) ==========

// Employee routes
router.get("/employee/:employeeId", getPayrollByEmployee);

// Payroll Aggregation Routes - SPECIFIC PATHS FIRST!
router.get("/calculate-net-pay", requireManager, calculateNetPay);
router.get("/employee-summary/:employeeId", requireManager, getEmployeePayrollSummary);
router.get("/department-stats", requireManager, getDepartmentPayrollStats);
// top-earners route removed: controller export not found
// tax-breakdown route removed: controller export not found
// trends route removed: controller export not found
// comparison route removed: controller export not found
router.get("/summary", requireManager, getPayrollSummary);

// ========== PARAMETER ROUTES (MUST COME LAST) ==========

// Get all payroll records (with pagination)
router.get("/", requireManager, getAllPayrollRecords);

// Get payroll by ID - MUST BE LAST!
router.get("/:id", requireManager, getPayrollById);

// ========== POST/PUT/DELETE ROUTES ==========

// Generate payroll (HR only)
router.post("/generate", requireHR, generatePayroll);

// Update payroll (HR only)
router.put("/:id", requireHR, updatePayroll);

// Process payment (HR only)
router.put("/:id/payment", requireHR, processPayment);

// Delete payroll (Admin only)
router.delete("/:id", requireAdmin, deletePayroll);

export default router;
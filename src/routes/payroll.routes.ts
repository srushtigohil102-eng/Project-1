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
  getEmployeePayrollSummary
} from "../controllers/payroll.controller";
import { verifyTokenMiddleware } from "../middleware/auth.middleware";
import { requireAdmin, requireHR, requireManager } from "../middleware/role.middleware";

const router = Router();

router.use(verifyTokenMiddleware);

// Employee can view their own payroll
router.get("/employee/:employeeId", getPayrollByEmployee);

// Manager/HR/Admin routes
router.get("/", requireManager, getAllPayrollRecords);
router.get("/summary", requireManager, getPayrollSummary);
router.get("/calculate-net-pay", requireManager, calculateNetPay);
router.get("/employee-summary/:employeeId", requireManager, getEmployeePayrollSummary);
router.get("/:id", requireManager, getPayrollById);

// HR/Admin only
router.post("/generate", requireHR, generatePayroll);
router.put("/:id", requireHR, updatePayroll);
router.put("/:id/payment", requireHR, processPayment);
router.delete("/:id", requireAdmin, deletePayroll);

export default router;
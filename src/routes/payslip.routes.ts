import { Router } from 'express';
import { 
  generatePayslip, 
  getPayslipData, 
  downloadPayslip 
} from '../controllers/payslip.controller';
import { verifyTokenMiddleware } from '../middleware/auth.middleware';
import { requireManager } from '../middleware/role.middleware';

const router = Router();

router.use(verifyTokenMiddleware);

// ===== Member A's Route: Download by Payroll ID =====
router.get('/download/:id', requireManager, downloadPayslip);

// ===== Employee Payslip Routes =====
router.get('/employee/:employeeId', requireManager, generatePayslip);
router.get('/employee/:employeeId/data', requireManager, getPayslipData);

// ===== Admin/HR Routes =====
router.get('/:employeeId', requireManager, generatePayslip);
router.get('/:employeeId/data', requireManager, getPayslipData);

export default router;
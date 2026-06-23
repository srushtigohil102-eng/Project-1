import { Router } from 'express';
import { generatePayslip, getPayslipData } from '../controllers/payslip.controller';
import { verifyTokenMiddleware } from '../middleware/auth.middleware';
import { requireManager } from '../middleware/role.middleware';

const router = Router();

router.use(verifyTokenMiddleware);

// Employee can view their own payslip
router.get('/employee/:employeeId', requireManager, generatePayslip);
router.get('/employee/:employeeId/data', requireManager, getPayslipData);

// Admin/HR can generate for any employee
router.get('/:employeeId', requireManager, generatePayslip);
router.get('/:employeeId/data', requireManager, getPayslipData);

export default router;
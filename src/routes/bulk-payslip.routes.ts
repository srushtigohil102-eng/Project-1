import { Router } from 'express';
import {
  generateBulkPayslips,
  generateDepartmentPayslips,
  getAvailableMonths
} from '../controllers/bulk-payslip.controller';
import { verifyTokenMiddleware } from '../middleware/auth.middleware';
import { requireHR } from '../middleware/role.middleware';

const router = Router();

router.use(verifyTokenMiddleware);
router.use(requireHR); // Only HR and Admin can generate bulk payslips

// Bulk payslip generation
router.post('/bulk', generateBulkPayslips);
router.get('/department/:departmentId/:month/:year', generateDepartmentPayslips);
router.get('/employee/:employeeId/months', getAvailableMonths);

export default router;
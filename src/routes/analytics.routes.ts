import { Router } from "express";
import {
  getEmployeesWithDetails,
  getDepartmentHierarchy,
  getOrgChart,
  getEmployeeHierarchy,
  getDepartmentReports,
  getDepartmentDistribution,
  getDepartmentLeaveReports,
  getPendingLeaveSummary,
  getLeaveTypeDistribution
} from "../controllers/analytics.controller";
import { verifyTokenMiddleware } from "../middleware/auth.middleware";
import { requireManager } from "../middleware/role.middleware";

const router = Router();

router.use(verifyTokenMiddleware);
router.use(requireManager);

// ========== EMPLOYEE AGGREGATIONS ==========
router.get("/employees-details", getEmployeesWithDetails);
router.get("/department-hierarchy", getDepartmentHierarchy);
router.get("/org-chart", getOrgChart);
router.get("/employee-hierarchy/:id", getEmployeeHierarchy);

// ========== DEPARTMENT REPORTS ==========
router.get("/department-reports", getDepartmentReports);
router.get("/department-distribution", getDepartmentDistribution);

// ========== LEAVE REPORTS ==========
router.get("/department-leave-reports", getDepartmentLeaveReports);
router.get("/pending-leave-summary", getPendingLeaveSummary);
router.get("/leave-type-distribution", getLeaveTypeDistribution);

export default router;
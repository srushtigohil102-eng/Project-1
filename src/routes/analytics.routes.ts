import { Router } from "express";
import {
  getEmployeesWithDetails,
  getDepartmentHierarchy,
  getOrgChart,
  getEmployeeHierarchy,
  getDepartmentReports,
  getDepartmentDistribution
} from "../controllers/analytics.controller";
import { verifyTokenMiddleware } from "../middleware/auth.middleware";
import { requireManager } from "../middleware/role.middleware";

const router = Router();

router.use(verifyTokenMiddleware);
router.use(requireManager);

//  routes
router.get("/employees-details", getEmployeesWithDetails);
router.get("/department-hierarchy", getDepartmentHierarchy);
router.get("/org-chart", getOrgChart);
router.get("/employee-hierarchy/:id", getEmployeeHierarchy);
router.get("/department-reports", getDepartmentReports);
router.get("/department-distribution", getDepartmentDistribution);

export default router;
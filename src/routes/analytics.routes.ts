import { Router } from "express";
import {
  getEmployeesWithDetails,
  getDepartmentHierarchy,
  getOrgChart,
  getEmployeeHierarchy
} from "../controllers/analytics.controller";
import { verifyTokenMiddleware } from "../middleware/auth.middleware";
import { requireManager } from "../middleware/role.middleware";

const router = Router();

router.use(verifyTokenMiddleware);
router.use(requireManager);

// Existing routes
router.get("/employees-details", getEmployeesWithDetails);
router.get("/department-hierarchy", getDepartmentHierarchy);
router.get("/org-chart", getOrgChart);
router.get("/employee-hierarchy/:id", getEmployeeHierarchy);

export default router;
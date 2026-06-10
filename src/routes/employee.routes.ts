import { Router } from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByDepartment
} from "../controllers/employee.controller";
import { verifyTokenMiddleware } from "../middleware/auth.middleware";
import { requireAdmin, requireHR, requireManager } from "../middleware/role.middleware";

const router = Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

// Public within authenticated users
router.get("/", requireManager, getAllEmployees);
router.get("/:id", requireManager, getEmployeeById);
router.get("/department/:departmentId", requireManager, getEmployeesByDepartment);

// Admin/HR only
router.post("/", requireHR, createEmployee);
router.put("/:id", requireHR, updateEmployee);
router.delete("/:id", requireAdmin, deleteEmployee);

export default router;
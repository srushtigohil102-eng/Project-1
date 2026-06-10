import { Router } from "express";
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentEmployees
} from "../controllers/department.controller";
import { verifyTokenMiddleware } from "../middleware/auth.middleware";
import { requireAdmin, requireHR } from "../middleware/role.middleware";

const router = Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

// Public within authenticated users
router.get("/", getAllDepartments);
router.get("/:id", getDepartmentById);
router.get("/:id/employees", getDepartmentEmployees);

// Admin/HR only
router.post("/", requireHR, createDepartment);
router.put("/:id", requireHR, updateDepartment);
router.delete("/:id", requireAdmin, deleteDepartment);

export default router;
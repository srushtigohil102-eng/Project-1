 import express from "express";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController";
import { verifyToken, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  requireRole("hr_manager"),
  getEmployees
);

router.post(
  "/",
  verifyToken,
  requireRole("hr_manager"),
  createEmployee
);

router.put(
  "/:id",
  verifyToken,
  requireRole("hr_manager"),
  updateEmployee
);

router.delete(
  "/:id",
  verifyToken,
  requireRole("hr_manager"),
  deleteEmployee
);

export default router;
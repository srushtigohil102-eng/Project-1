import express from "express";
import { getEmployees } from "../controllers/employeeController";
import { authenticate, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticate, requireRole("hr_manager"), getEmployees);

export default router;

import express from "express";
import { getEmployees } from "../controllers/employeeController";
import { verifyToken, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", verifyToken, requireRole("hr_manager"), getEmployees);

export default router;
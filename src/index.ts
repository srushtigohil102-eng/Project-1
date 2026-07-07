import express, { type Application, type Request, type Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import employeeRoutes from "./routes/employee.routes";
import departmentRoutes from "./routes/department.routes";
import leaveRoutes from "./routes/leave.routes";
import payrollRoutes from "./routes/payroll.routes";
import analyticsRoutes from "./routes/analytics.routes";
import payslipRoutes from "./routes/payslip.routes";
import bulkPayslipRoutes from "./routes/bulk-payslip.routes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ----- CORS — MUST be registered before routes and other middleware -----
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ----- Security headers -----
app.use(helmet());

// ----- Rate limiting -----
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use("/api/", limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts, please try again later" },
});

// ----- Body parsers -----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----- Routes -----
app.use("/api/auth", authLimiter, authRoutes);

// Test route to verify token middleware works in isolation
import { verifyTokenMiddleware } from "./middleware/auth.middleware";
app.get("/api/test-auth", verifyTokenMiddleware, (_req: Request, res: Response) => {
  res.json({ success: true, message: "Token is valid!", user: (_req as any).user });
});

app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payslip", payslipRoutes);
app.use("/api/payslip", bulkPayslipRoutes);


// ----- Root -----
app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Enterprise HRMS & Payroll Automation API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      employees: "/api/employees",
      departments: "/api/departments",
      leaves: "/api/leaves",
      payroll: "/api/payroll",
      health: "/health",
    },
  });
});

// ----- Health check (polled by frontend ApiStatus component) -----
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    mongodb:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// ----- Global error handler (must be last) -----
app.use(errorHandler);

// ----- Start -----
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`✅ All CRUD APIs ready!\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

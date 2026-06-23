import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import employeeRoutes from "./routes/employee.routes";
import departmentRoutes from "./routes/department.routes";
import leaveRoutes from "./routes/leave.routes";
import payrollRoutes from "./routes/payroll.routes";
import analyticsRoutes from "./routes/analytics.routes";
import payslipRoutes from "./routes/payslip.routes";



dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payslip", payslipRoutes);


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
      health: "/health"
    }
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date(), mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" });
});

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
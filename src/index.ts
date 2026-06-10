import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import employeeRoutes from "./routes/employee.routes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Enterprise HRMS & Payroll Automation API",
    version: "1.0.0",
    endpoints: {
      auth: {
        login: "POST /api/auth/login",
        register: "POST /api/auth/register",
        me: "GET /api/auth/me",
        changePassword: "POST /api/auth/change-password"
      },
      employees: {
        getAll: "GET /api/employees",
        getById: "GET /api/employees/:id",
        create: "POST /api/employees",
        update: "PUT /api/employees/:id",
        delete: "DELETE /api/employees/:id",
        byDepartment: "GET /api/employees/department/:departmentId"
      },
      health: "/health"
    }
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`\n📋 Available Endpoints:`);
      console.log(`   Auth:`);
      console.log(`     POST   /api/auth/login`);
      console.log(`     POST   /api/auth/register (Admin/HR)`);
      console.log(`     GET    /api/auth/me`);
      console.log(`   Employees:`);
      console.log(`     GET    /api/employees`);
      console.log(`     GET    /api/employees/:id`);
      console.log(`     POST   /api/employees (Admin/HR)`);
      console.log(`     PUT    /api/employees/:id (Admin/HR)`);
      console.log(`     DELETE /api/employees/:id (Admin)\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
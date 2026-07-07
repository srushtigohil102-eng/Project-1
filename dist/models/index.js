import express from "express";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import dotenv from "dotenv";
import authRoutes from "../routes/auth.routes";
import employeeRoutes from "../routes/employee.routes";
import departmentRoutes from "../routes/department.routes";
import leaveRoutes from "../routes/leave.routes";
import payrollRoutes from "../routes/payroll.routes";
import analyticsRoutes from "../routes/analytics.routes";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/analytics", analyticsRoutes);
app.get("/health", (_req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date(),
        mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development"
    });
});
app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "Enterprise HRMS & Payroll Automation API",
        version: "2.0.0",
        timestamp: new Date(),
        modules: {
            auth: {
                base: "/api/auth",
                endpoints: {
                    login: "POST /api/auth/login",
                    register: "POST /api/auth/register",
                    me: "GET /api/auth/me",
                    changePassword: "POST /api/auth/change-password",
                    logout: "POST /api/auth/logout"
                }
            },
            employees: {
                base: "/api/employees",
                endpoints: {
                    getAll: "GET /api/employees",
                    getById: "GET /api/employees/:id",
                    create: "POST /api/employees",
                    update: "PUT /api/employees/:id",
                    delete: "DELETE /api/employees/:id",
                    byDepartment: "GET /api/employees/department/:departmentId"
                }
            },
            departments: {
                base: "/api/departments",
                endpoints: {
                    getAll: "GET /api/departments",
                    getById: "GET /api/departments/:id",
                    create: "POST /api/departments",
                    update: "PUT /api/departments/:id",
                    delete: "DELETE /api/departments/:id",
                    employees: "GET /api/departments/:id/employees"
                }
            },
            leaves: {
                base: "/api/leaves",
                endpoints: {
                    getAll: "GET /api/leaves",
                    create: "POST /api/leaves",
                    update: "PUT /api/leaves/:id",
                    process: "PUT /api/leaves/:id/process",
                    cancel: "DELETE /api/leaves/:id/cancel",
                    balance: "GET /api/leaves/balance"
                }
            },
            payroll: {
                base: "/api/payroll",
                endpoints: {
                    getAll: "GET /api/payroll",
                    getById: "GET /api/payroll/:id",
                    getByEmployee: "GET /api/payroll/employee/:employeeId",
                    generate: "POST /api/payroll/generate",
                    update: "PUT /api/payroll/:id",
                    processPayment: "PUT /api/payroll/:id/payment",
                    delete: "DELETE /api/payroll/:id",
                    summary: "GET /api/payroll/summary",
                    calculateNetPay: "GET /api/payroll/calculate-net-pay",
                    employeeSummary: "GET /api/payroll/employee-summary/:employeeId",
                    departmentStats: "GET /api/payroll/department-stats",
                    monthlySummary: "GET /api/payroll/monthly-summary",
                    topEarners: "GET /api/payroll/top-earners",
                    taxBreakdown: "GET /api/payroll/tax-breakdown",
                    trends: "GET /api/payroll/trends",
                    comparison: "GET /api/payroll/comparison"
                }
            },
            analytics: {
                base: "/api/analytics",
                endpoints: {
                    employeesDetails: "GET /api/analytics/employees-details",
                    departmentHierarchy: "GET /api/analytics/department-hierarchy",
                    orgChart: "GET /api/analytics/org-chart",
                    employeeHierarchy: "GET /api/analytics/employee-hierarchy/:id",
                    departmentReports: "GET /api/analytics/department-reports",
                    departmentDistribution: "GET /api/analytics/department-distribution",
                    departmentLeaveReports: "GET /api/analytics/department-leave-reports",
                    pendingLeaveSummary: "GET /api/analytics/pending-leave-summary",
                    leaveTypeDistribution: "GET /api/analytics/leave-type-distribution"
                }
            },
            health: "/health"
        }
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl
    });
});
app.use((err, _req, res, _next) => {
    console.error("Error:", err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`\n${"=".repeat(60)}`);
            console.log(`🚀 SERVER STARTED SUCCESSFULLY`);
            console.log(`${"=".repeat(60)}`);
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
            console.log(`📦 Database: ${mongoose.connection.name}`);
            console.log(`${"=".repeat(60)}\n`);
            console.log(`📋 AVAILABLE MODULES:\n`);
            console.log(`   🔐 Auth          → /api/auth`);
            console.log(`   👥 Employees     → /api/employees`);
            console.log(`   🏢 Departments   → /api/departments`);
            console.log(`   📅 Leaves        → /api/leaves`);
            console.log(`   💰 Payroll       → /api/payroll`);
            console.log(`   📊 Analytics     → /api/analytics`);
            console.log(`   ❤️  Health        → /health`);
            console.log(`\n${"=".repeat(60)}`);
            console.log(`✅ API ready to accept requests\n`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
process.on("SIGINT", async () => {
    console.log("\n⚠️  Received SIGINT. Shutting down gracefully...");
    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
    process.exit(0);
});
process.on("SIGTERM", async () => {
    console.log("\n⚠️  Received SIGTERM. Shutting down gracefully...");
    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
    process.exit(0);
});

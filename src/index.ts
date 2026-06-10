import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

// Basic route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Enterprise HRMS & Payroll Automation API",
    version: "1.0.0",
    endpoints: {
      auth: {
        login: "POST /api/auth/login",
        register: "POST /api/auth/register (Admin/HR only)",
        me: "GET /api/auth/me",
        changePassword: "POST /api/auth/change-password",
        logout: "POST /api/auth/logout"
      },
      health: "/health"
    }
  });
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`✅ API ready\n`);
      console.log(`📋 Auth Endpoints:`);
      console.log(`   POST   /api/auth/login        - Login`);
      console.log(`   POST   /api/auth/register     - Register (Admin/HR)`);
      console.log(`   GET    /api/auth/me           - Current user`);
      console.log(`   POST   /api/auth/change-password - Change password`);
      console.log(`   POST   /api/auth/logout       - Logout\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
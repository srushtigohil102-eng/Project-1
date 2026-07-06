import { Request, Response } from "express";
import { Employee } from "../models/Employee";
import { Department } from "../models/Department";
import { generateToken } from "../utils/jwt.utils";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required" });
      return;
    }
    
    const employee = await Employee.findOne({ email: email.toLowerCase() })
      .select("+password")
      .populate("department", "name code");
    
    if (!employee) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }
    
    if (employee.status !== "Active") {
      res.status(401).json({ success: false, message: `Account is ${employee.status}. Please contact HR.` });
      return;
    }
    
    const isPasswordValid = await employee.comparePassword(password);
    
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }
    
    employee.lastLogin = new Date();
    await employee.save();
    
    const token = generateToken({
      id: employee._id.toString(),
      email: employee.email,
      role: employee.role,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName
    });
    
    const employeeData = employee.toObject();
    delete (employeeData as any).password;
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { token, employee: employeeData }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed", error: (error as Error).message });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, phoneNumber, role, department, designation, salary } = req.body;
    
    if (!firstName || !lastName || !email || !phoneNumber || !designation) {
      res.status(400).json({ success: false, message: "Missing required fields: firstName, lastName, email, phoneNumber, designation" });
      return;
    }
    
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      res.status(400).json({ success: false, message: "Email already registered" });
      return;
    }
    
    if (department) {
      const deptExists = await Department.findById(department);
      if (!deptExists) {
        res.status(400).json({ success: false, message: "Department not found" });
        return;
      }
    }
    
    const employee = await Employee.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phoneNumber,
      role: role || "Employee",
      department: department || null,
      designation,
      salary: salary || 0,
      dateOfBirth: req.body.dateOfBirth || new Date("1990-01-01"),
      gender: req.body.gender || "Prefer not to say",
      joiningDate: req.body.joiningDate || new Date(),
      password: req.body.password || "Welcome@123",
      status: "Active",
      isActive: true,
      createdBy: req.user?.id
    });
    
    const employeeResponse = employee.toObject();
    delete (employeeResponse as any).password;
    
    res.status(201).json({
      success: true,
      message: "Employee registered successfully",
      data: employeeResponse
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Registration failed", error: (error as Error).message });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findById(req.user?.id)
      .populate("department", "name code")
      .populate("manager", "firstName lastName email");
    
    if (!employee) {
      res.status(404).json({ success: false, message: "Employee not found" });
      return;
    }
    
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch user", error: (error as Error).message });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: "Current and new password are required" });
      return;
    }
    
    if (newPassword.length < 8) {
      res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
      return;
    }
    
    const employee = await Employee.findById(req.user?.id).select("+password");
    
    if (!employee) {
      res.status(404).json({ success: false, message: "Employee not found" });
      return;
    }
    
    const isPasswordValid = await employee.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: "Current password is incorrect" });
      return;
    }
    
    employee.password = newPassword;
    await employee.save();
    
    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to change password", error: (error as Error).message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;

    if (!name && !email) {
      res.status(400).json({ success: false, message: "At least one field (name or email) is required" });
      return;
    }

    if (email) {
      const existing = await Employee.findOne({ email: email.toLowerCase(), _id: { $ne: req.user?.id } });
      if (existing) {
        res.status(400).json({ success: false, message: "Email already in use" });
        return;
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name) {
      const parts = name.trim().split(/\s+/);
      updateData.firstName = parts[0] || "";
      updateData.lastName = parts.slice(1).join(" ") || "";
    }
    if (email) {
      updateData.email = email.toLowerCase();
    }

    const employee = await Employee.findByIdAndUpdate(req.user?.id, updateData, { new: true, runValidators: true });

    if (!employee) {
      res.status(404).json({ success: false, message: "Employee not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: employee._id.toString(),
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        role: employee.role,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update profile", error: (error as Error).message });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, message: "Logout successful. Please remove token from client." });
};

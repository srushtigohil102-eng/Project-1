import { Request, Response } from "express";
import { Employee } from "../models/Employee";
import { Department as DepartmentModel } from "../models/Department";

// Get all employees with pagination and filters
export const getAllEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, department, role, status, search } = req.query;
    
    const filter: any = { isActive: true };
    if (department) filter.department = department;
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } }
      ];
    }
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .populate("department", "name code")
        .populate("manager", "firstName lastName email")
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Employee.countDocuments(filter)
    ]);
    
    res.status(200).json({
      success: true,
      data: employees,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch employees", error: (error as Error).message });
  }
};

// Get employee by ID
export const getEmployeeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate("department", "name code description")
      .populate("manager", "firstName lastName email employeeId designation");
    
    if (!employee) {
      res.status(404).json({ success: false, message: "Employee not found" });
      return;
    }
    
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch employee", error: (error as Error).message });
  }
};

// Create new employee
export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    const existingEmail = await Employee.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ success: false, message: "Email already exists" });
      return;
    }
    
    const employee = await Employee.create({
      ...req.body,
      password: req.body.password || "Welcome@123",
      createdBy: req.user?.id
    });
    
    const employeeData = employee.toObject();
    delete (employeeData as any).password;
    
    res.status(201).json({ success: true, data: employeeData, message: "Employee created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create employee", error: (error as Error).message });
  }
};

// Update employee
export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    if (email) {
      const existingEmail = await Employee.findOne({ email, _id: { $ne: req.params.id } });
      if (existingEmail) {
        res.status(400).json({ success: false, message: "Email already exists" });
        return;
      }
    }
    
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?.id },
      { new: true, runValidators: true }
    );
    
    if (!employee) {
      res.status(404).json({ success: false, message: "Employee not found" });
      return;
    }
    
    res.status(200).json({ success: true, data: employee, message: "Employee updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update employee", error: (error as Error).message });
  }
};

// Delete employee (soft delete)
export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isActive: false, status: "Terminated", leavingDate: new Date(), updatedBy: req.user?.id },
      { new: true }
    );
    
    if (!employee) {
      res.status(404).json({ success: false, message: "Employee not found" });
      return;
    }
    
    res.status(200).json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete employee", error: (error as Error).message });
  }
};

// Get employees by department
export const getEmployeesByDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const employees = await Employee.find({ department: req.params.departmentId, isActive: true })
      .select("firstName lastName email employeeId designation role status");
    
    const department = await DepartmentModel.findById(req.params.departmentId).select("name code");
    
    res.status(200).json({
      success: true,
      data: { department, count: employees.length, employees }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch employees", error: (error as Error).message });
  }
};
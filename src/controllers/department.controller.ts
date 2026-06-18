import { Request, Response } from "express";
import { Department } from "../models/Department";
import { Employee } from "../models/Employee";

// Get all departments
export const getAllDepartments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const departments = await Department.find()
      .populate("departmentHead", "firstName lastName email employeeId")
      .sort({ name: 1 });
    
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch departments", error: (error as Error).message });
  }
};

// Get department by ID
export const getDepartmentById = async (_req: Request, res: Response): Promise<void> => {
  try {
    const department = await Department.findById(_req.params.id)
      .populate("departmentHead", "firstName lastName email employeeId");
    
    if (!department) {
      res.status(404).json({ success: false, message: "Department not found" });
      return;
    }
    
    // Get employee count for this department
    const employeeCount = await Employee.countDocuments({ department: department._id, isActive: true });
    
    res.status(200).json({ success: true, data: { ...department.toObject(), employeeCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch department", error: (error as Error).message });
  }
};

// Create department
export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code } = req.body;
    
    const existingDept = await Department.findOne({ $or: [{ name }, { code }] });
    if (existingDept) {
      res.status(400).json({ success: false, message: "Department with same name or code already exists" });
      return;
    }
    
    const department = await Department.create(req.body);
    
    res.status(201).json({ success: true, data: department, message: "Department created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create department", error: (error as Error).message });
  }
};

// Update department
export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!department) {
      res.status(404).json({ success: false, message: "Department not found" });
      return;
    }
    
    res.status(200).json({ success: true, data: department, message: "Department updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update department", error: (error as Error).message });
  }
};

// Delete department (soft delete)
export const deleteDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if there are employees in this department
    const employeeCount = await Employee.countDocuments({ department: req.params.id, isActive: true });
    
    if (employeeCount > 0) {
      res.status(400).json({ 
        success: false, 
        message: `Cannot delete department. ${employeeCount} employees are currently assigned to this department.` 
      });
      return;
    }
    
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!department) {
      res.status(404).json({ success: false, message: "Department not found" });
      return;
    }
    
    res.status(200).json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete department", error: (error as Error).message });
  }
};

// Get department employees
export const getDepartmentEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const employees = await Employee.find({ department: req.params.id, isActive: true })
      .select("firstName lastName email employeeId designation role status joiningDate");
    
    const department = await Department.findById(req.params.id).select("name code");
    
    res.status(200).json({
      success: true,
      data: { department, count: employees.length, employees }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch department employees", error: (error as Error).message });
  }
};
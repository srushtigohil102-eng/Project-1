import type { Request, Response } from "express";

/**
 * Employee Controller
 * Handles Employee CRUD Operations
 */

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive";
  salary: number;
}

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "emp-001",
    name: "John Employee",
    email: "employee@company.com",
    department: "Engineering",
    role: "Software Developer",
    status: "active",
    salary: 75000,
  },
  {
    id: "emp-002",
    name: "Priya Sharma",
    email: "priya.sharma@company.com",
    department: "HR",
    role: "HR Specialist",
    status: "active",
    salary: 62000,
  },
  {
    id: "emp-003",
    name: "Rahul Mehta",
    email: "rahul.mehta@company.com",
    department: "Finance",
    role: "Accountant",
    status: "active",
    salary: 68000,
  },
  {
    id: "emp-004",
    name: "Anita Desai",
    email: "anita.desai@company.com",
    department: "Marketing",
    role: "Marketing Lead",
    status: "active",
    salary: 71000,
  },
  {
    id: "emp-005",
    name: "Vikram Singh",
    email: "vikram.singh@company.com",
    department: "Engineering",
    role: "QA Engineer",
    status: "inactive",
    salary: 58000,
  },
  {
    id: "emp-006",
    name: "Sneha Patel",
    email: "sneha.patel@company.com",
    department: "Design",
    role: "UI Designer",
    status: "active",
    salary: 65000,
  },
];

/**
 * GET /employees
 * Returns all employees.
 */
export const getEmployees = (_req: Request, res: Response): void => {
  try {
    res.status(200).json({
      success: true,
      data: MOCK_EMPLOYEES,
    });
  } catch (error) {
    console.error("Get Employees Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * POST /employees
 * Creates a new employee.
 */
export const createEmployee = (req: Request, res: Response): void => {
  try {
    let { name, email, department, role, salary } = req.body;

    if (!name || !email || !department || !role || salary === undefined) {
      res.status(400).json({
        success: false,
        message: "All employee fields are required",
      });
      return;
    }

    name = name.trim();
    email = email.trim();
    department = department.trim();
    role = role.trim();

    if (!email.includes("@")) {
      res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
      return;
    }

    if (typeof salary !== "number" || salary <= 0) {
      res.status(400).json({
        success: false,
        message: "Salary must be greater than zero",
      });
      return;
    }

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name,
      email,
      department,
      role,
      salary,
      status: "active",
    };

    MOCK_EMPLOYEES.push(newEmployee);

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: newEmployee,
    });
  } catch (error) {
    console.error("Create Employee Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * PUT /employees/:id
 * Updates an existing employee.
 */
export const updateEmployee = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    const employee = MOCK_EMPLOYEES.find((emp) => emp.id === id);

    if (!employee) {
      res.status(404).json({
        success: false,
        message: "Employee not found",
      });
      return;
    }

    if (Object.keys(req.body).length === 0) {
      res.status(400).json({
        success: false,
        message: "No update data provided",
      });
      return;
    }

    Object.assign(employee, req.body);

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Update Employee Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * DELETE /employees/:id
 * Deletes an employee.
 */
export const deleteEmployee = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;

    const employeeIndex = MOCK_EMPLOYEES.findIndex(
      (emp) => emp.id === id
    );

    if (employeeIndex === -1) {
      res.status(404).json({
        success: false,
        message: "Employee not found",
      });
      return;
    }

    MOCK_EMPLOYEES.splice(employeeIndex, 1);

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete Employee Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
import type { Request, Response } from "express";

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

export const getEmployees = (_req: Request, res: Response): void => {
  res.status(200).json(MOCK_EMPLOYEES);
};

export const createEmployee = (req: Request, res: Response): void => {
  const { name, email, department, role, salary } = req.body;

  if (!name || !email || !department || !role || salary === undefined) {
    res.status(400).json({
      message: "All employee fields are required",
    });
    return;
  }

  const newEmployee: Employee = {
    id: `emp-${Date.now()}`,
    ...req.body,
  };

  MOCK_EMPLOYEES.push(newEmployee);

  res.status(201).json({
    message: "Employee created successfully",
    employee: newEmployee,
  });
};

export const updateEmployee = (req: Request, res: Response): void => {
  const { id } = req.params;

  const employee = MOCK_EMPLOYEES.find((emp) => emp.id === id);

  if (!employee) {
    res.status(404).json({
      message: "Employee not found",
    });
    return;
  }

  if (Object.keys(req.body).length === 0) {
    res.status(400).json({
      message: "No update data provided",
    });
    return;
  }

  Object.assign(employee, req.body);

  res.status(200).json({
    message: "Employee updated successfully",
    employee,
  });
};

export const deleteEmployee = (req: Request, res: Response): void => {
  const { id } = req.params;

  const employeeIndex = MOCK_EMPLOYEES.findIndex(
    (emp) => emp.id === id
  );

  if (employeeIndex === -1) {
    res.status(404).json({
      message: "Employee not found",
    });
    return;
  }

  MOCK_EMPLOYEES.splice(employeeIndex, 1);

  res.status(200).json({
    message: "Employee deleted successfully",
  });
};
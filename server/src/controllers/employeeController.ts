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

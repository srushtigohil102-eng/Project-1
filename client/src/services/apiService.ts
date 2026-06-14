import apiFetch from '../utils/api';

// ==========================================
// TypeScript Interfaces
// ==========================================

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
  salary: number;
  createdAt: string;
}

export interface CreateEmployeeData {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  department: string;
  role: string;
  employmentType: string;
  reportingManager?: string;
  startDate: string;
  basicSalary: number;
  allowances: number;
  systemRole: string;
  password?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  rejectReason?: string;
}

export interface ApplyLeaveData {
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
}

// ==========================================
// Employee API Functions
// ==========================================

export async function getEmployees(): Promise<Employee[]> {
  return apiFetch<Employee[]>('/employees');
}

export async function getEmployeeById(id: string): Promise<Employee> {
  return apiFetch<Employee>(`/employees/${id}`);
}

export async function createEmployee(data: CreateEmployeeData): Promise<Employee> {
  return apiFetch<Employee>('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEmployee(id: string, data: Partial<CreateEmployeeData>): Promise<Employee> {
  return apiFetch<Employee>(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEmployee(id: string): Promise<void> {
  return apiFetch<void>(`/employees/${id}`, {
    method: 'DELETE',
  });
}

// ==========================================
// Leave API Functions
// ==========================================

export async function getLeaves(): Promise<LeaveRequest[]> {
  return apiFetch<LeaveRequest[]>('/leave');
}

export async function getLeaveById(id: string): Promise<LeaveRequest> {
  return apiFetch<LeaveRequest>(`/leave/${id}`);
}

export async function applyLeave(data: ApplyLeaveData): Promise<LeaveRequest> {
  return apiFetch<LeaveRequest>('/leave/apply', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function approveLeave(id: string): Promise<LeaveRequest> {
  return apiFetch<LeaveRequest>(`/leave/${id}/approve`, {
    method: 'PUT',
  });
}

export async function rejectLeave(id: string, reason: string): Promise<LeaveRequest> {
  return apiFetch<LeaveRequest>(`/leave/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
}

// ==========================================
// Payroll API Functions
// ==========================================

export async function getPayroll(): Promise<PayrollRecord[]> {
  return apiFetch<PayrollRecord[]>('/payroll');
}

export async function getPayrollByEmployee(id: string): Promise<PayrollRecord[]> {
  return apiFetch<PayrollRecord[]>(`/payroll/${id}`);
}

export async function downloadPayslip(id: string): Promise<unknown> {
  return apiFetch<unknown>(`/payroll/${id}/download`);
}

export async function runPayroll(): Promise<PayrollRecord[]> {
  return apiFetch<PayrollRecord[]>('/payroll/run', {
    method: 'POST',
  });
}

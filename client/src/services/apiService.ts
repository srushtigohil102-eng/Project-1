import apiFetch from '../utils/api';

// ==========================================
// Generic API Response Wrapper
// ==========================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: { page: number; limit: number; total: number; pages: number };
}

// ==========================================
// Type Aliases
// ==========================================

export type EmployeeRole = 'Admin' | 'HR' | 'Manager' | 'Employee';
export type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive';
export type LeaveType = 'Sick' | 'Casual' | 'Annual' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Bereavement' | 'Study';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
export type PayrollStatus = 'Processed' | 'Paid';

// ==========================================
// Department Interface
// ==========================================

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  budget: number;
  location: string;
  phoneNumber: string;
  email: string;
  departmentHead: string;
}

// ==========================================
// Employee Interface (real shape from backend)
// ==========================================

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: EmployeeRole;
  department: {
    id: string;
    name: string;
    code: string;
  };
  designation: string;
  salary: number;
  status: EmployeeStatus;
  isActive: boolean;
  manager: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
  } | null;
  joiningDate: string;
  createdAt: string;
}

export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: EmployeeRole;
  department: string;
  designation: string;
  salary: number;
  dateOfBirth: string;
  gender: string;
  joiningDate: string;
  password?: string;
}

// ==========================================
// Leave Request Interface
// ==========================================

export interface LeaveRequest {
  id: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    employeeId: string;
  };
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  numberOfDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
  } | null;
  approvedAt?: string;
  rejectionReason?: string;
  appliedAt: string;
  notifiedTo: string[];
  createdAt: string;
}

export interface ApplyLeaveData {
  leaveType: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  reason: string;
}

// ==========================================
// Payroll Record Interface
// ==========================================

export interface PayrollRecord {
  _id?: string;
  id: string;
  employee: {
    id: string;
    _id?: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    employeeId: string;
    department?: {
      id: string;
      name: string;
    };
  };
  month: number;
  year: number;
  salaryBreakdown: {
    basic: number;
    hra: number;
    da: number;
    ta: number;
    medicalAllowance: number;
    specialAllowance: number;
    bonus: number;
  };
  deductionBreakdown: {
    tax: number;
    providentFund: number;
    professionalTax: number;
    insurance: number;
  };
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  holidayDays: number;
  paymentDate: string | null;
  status: PayrollStatus;
  generatedBy: string;
  createdAt: string;
}

// ==========================================
// Employee API Functions
// ==========================================

export async function getEmployees(): Promise<Employee[]> {
  const res = await apiFetch<ApiResponse<Employee[]>>('/api/employees');
  return res.data;
}

export async function getEmployeeById(id: string): Promise<Employee> {
  const res = await apiFetch<ApiResponse<Employee>>(`/api/employees/${id}`);
  return res.data;
}

export async function checkEmailAvailable(email: string): Promise<{ available: boolean }> {
  return apiFetch<{ available: boolean }>(`/api/employees/check-email?email=${encodeURIComponent(email)}`);
}

export async function createEmployee(
  payload: CreateEmployeeData,
): Promise<Employee> {
  const res = await apiFetch<ApiResponse<Employee>>('/api/employees', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteEmployee(id: string): Promise<void> {
  return apiFetch<void>(`/api/employees/${id}`, {
    method: 'DELETE',
  });
}

// ==========================================
// Leave API Functions
// ==========================================

export async function getLeaves(): Promise<LeaveRequest[]> {
  const res = await apiFetch<ApiResponse<LeaveRequest[]>>('/api/leaves');
  return res.data;
}

export async function applyLeave(payload: ApplyLeaveData): Promise<LeaveRequest> {
  const res = await apiFetch<ApiResponse<LeaveRequest>>('/api/leaves/apply', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function approveLeave(id: string): Promise<LeaveRequest> {
  const res = await apiFetch<ApiResponse<LeaveRequest>>(`/api/leaves/${id}/approve`, {
    method: 'PUT',
  });
  return res.data;
}

export async function rejectLeave(
  id: string,
  reason: string,
): Promise<LeaveRequest> {
  const res = await apiFetch<ApiResponse<LeaveRequest>>(`/api/leaves/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
  return res.data;
}

// ==========================================
// Payroll API Functions
// ==========================================

function validatePayrollRecord(record: unknown, index: number): void {
  if (!record || typeof record !== 'object') {
    if (import.meta.env.DEV) {
      console.warn(`[Payroll] Record at index ${index} is not an object:`, record);
    }
    return;
  }
  const r = record as Record<string, unknown>;
  if (!r.salaryBreakdown || typeof r.salaryBreakdown !== 'object') {
    if (import.meta.env.DEV) {
      console.warn(`[Payroll] Record at index ${index} missing salaryBreakdown:`, r);
    }
  }
  if (!r.deductionBreakdown || typeof r.deductionBreakdown !== 'object') {
    if (import.meta.env.DEV) {
      console.warn(`[Payroll] Record at index ${index} missing deductionBreakdown:`, r);
    }
  }
}

export async function getPayroll(): Promise<PayrollRecord[]> {
  const res = await apiFetch<ApiResponse<PayrollRecord[]>>('/api/payroll');
  if (Array.isArray(res.data)) {
    res.data.forEach(validatePayrollRecord);
  } else if (import.meta.env.DEV) {
    console.warn('[Payroll] Expected res.data to be an array, got:', typeof res.data);
  }
  return res.data;
}

export async function getPayrollByEmployee(id: string): Promise<PayrollRecord[]> {
  const res = await apiFetch<ApiResponse<PayrollRecord[]>>(`/api/payroll/${id}`);
  if (Array.isArray(res.data)) {
    res.data.forEach(validatePayrollRecord);
  } else if (import.meta.env.DEV) {
    console.warn('[Payroll] getPayrollByEmployee: Expected res.data to be an array, got:', typeof res.data);
  }
  return res.data;
}

export async function runPayroll(): Promise<PayrollRecord[]> {
  const res = await apiFetch<ApiResponse<PayrollRecord[]>>('/api/payroll/run', {
    method: 'POST',
  });
  if (Array.isArray(res.data)) {
    res.data.forEach(validatePayrollRecord);
  } else if (import.meta.env.DEV) {
    console.warn('[Payroll] runPayroll: Expected res.data to be an array, got:', typeof res.data);
  }
  return res.data;
}

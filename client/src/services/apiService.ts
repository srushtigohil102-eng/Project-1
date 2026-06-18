import apiFetch from '../utils/api';

// ==========================================
// Helper: normalize MongoDB _id → id
// ==========================================

type MongoDoc = Record<string, unknown>;

function toAppEntity<T extends { id: string }>(doc: MongoDoc): T {
  const { _id, ...rest } = doc;
  return { id: _id as string, ...rest } as unknown as T;
}

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
  const data = await apiFetch<MongoDoc[]>('/employees');
  return data.map(toAppEntity<Employee>);
}

export async function getEmployeeById(id: string): Promise<Employee> {
  const data = await apiFetch<MongoDoc>(`/employees/${id}`);
  return toAppEntity<Employee>(data);
}

export async function createEmployee(
  payload: CreateEmployeeData,
): Promise<Employee> {
  const data = await apiFetch<MongoDoc>('/employees', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return toAppEntity<Employee>(data);
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
  const data = await apiFetch<MongoDoc[]>('/leave');
  return data.map(toAppEntity<LeaveRequest>);
}

export async function applyLeave(payload: ApplyLeaveData): Promise<LeaveRequest> {
  const data = await apiFetch<MongoDoc>('/leave/apply', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return toAppEntity<LeaveRequest>(data);
}

export async function approveLeave(id: string): Promise<LeaveRequest> {
  const data = await apiFetch<MongoDoc>(`/leave/${id}/approve`, {
    method: 'PUT',
  });
  return toAppEntity<LeaveRequest>(data);
}

export async function rejectLeave(
  id: string,
  reason: string,
): Promise<LeaveRequest> {
  const data = await apiFetch<MongoDoc>(`/leave/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
  return toAppEntity<LeaveRequest>(data);
}

// ==========================================
// Payroll API Functions
// ==========================================

export async function getPayroll(): Promise<PayrollRecord[]> {
  const data = await apiFetch<MongoDoc[]>('/payroll');
  return data.map(toAppEntity<PayrollRecord>);
}

export async function getPayrollByEmployee(id: string): Promise<PayrollRecord[]> {
  const data = await apiFetch<MongoDoc[]>(`/payroll/${id}`);
  return data.map(toAppEntity<PayrollRecord>);
}

export async function runPayroll(): Promise<PayrollRecord[]> {
  const data = await apiFetch<MongoDoc[]>('/payroll/run', {
    method: 'POST',
  });
  return data.map(toAppEntity<PayrollRecord>);
}

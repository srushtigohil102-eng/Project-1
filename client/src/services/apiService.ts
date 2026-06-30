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
  department: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: 'processed' | 'pending';
  processedAt: string;
}

// ==========================================
// Employee API Functions
// ==========================================

export async function getEmployees(): Promise<Employee[]> {
  const data = await apiFetch<MongoDoc[]>('/api/employees');
  return data.map(toAppEntity<Employee>);
}

export async function getEmployeeById(id: string): Promise<Employee> {
  const data = await apiFetch<MongoDoc>(`/api/employees/${id}`);
  return toAppEntity<Employee>(data);
}

export async function checkEmailAvailable(email: string): Promise<{ available: boolean }> {
  return apiFetch<{ available: boolean }>(`/api/employees/check-email?email=${encodeURIComponent(email)}`);
}

export async function createEmployee(
  payload: CreateEmployeeData,
): Promise<Employee> {
  const data = await apiFetch<MongoDoc>('/api/employees', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return toAppEntity<Employee>(data);
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
  const data = await apiFetch<MongoDoc[]>('/api/leaves');
  return data.map(toAppEntity<LeaveRequest>);
}

export async function applyLeave(payload: ApplyLeaveData): Promise<LeaveRequest> {
  const data = await apiFetch<MongoDoc>('/api/leaves/apply', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return toAppEntity<LeaveRequest>(data);
}

export async function approveLeave(id: string): Promise<LeaveRequest> {
  const data = await apiFetch<MongoDoc>(`/api/leaves/${id}/approve`, {
    method: 'PUT',
  });
  return toAppEntity<LeaveRequest>(data);
}

export async function rejectLeave(
  id: string,
  reason: string,
): Promise<LeaveRequest> {
  const data = await apiFetch<MongoDoc>(`/api/leaves/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
  return toAppEntity<LeaveRequest>(data);
}

// ==========================================
// Runtime Shape Validation
// ==========================================

const PAYROLL_RECORD_KEYS: (keyof PayrollRecord)[] = [
  'id', 'employeeId', 'employeeName', 'department', 'month', 'year',
  'basicSalary', 'allowances', 'deductions', 'netPay',
  'status', 'processedAt',
];

const NUMBER_FIELDS: Set<keyof PayrollRecord> = new Set([
  'month', 'year', 'basicSalary', 'allowances', 'deductions', 'netPay',
]);

/**
 * Runtime type guard that verifies an unknown value matches PayrollRecord.
 * Logs a warning to the console on first mismatch so integration bugs get
 * caught early instead of silently corrupting the UI.
 */
export function validatePayrollRecord(data: unknown): data is PayrollRecord {
  if (data === null || data === undefined || typeof data !== 'object') {
    console.warn('[validatePayrollRecord] expected an object, got', typeof data);
    return false;
  }

  const record = data as Record<string, unknown>;

  for (const key of PAYROLL_RECORD_KEYS) {
    if (!(key in record)) {
      console.warn(`[validatePayrollRecord] missing field "${key}" in`, record);
      return false;
    }

    const value = record[key];

    if (NUMBER_FIELDS.has(key)) {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        console.warn(
          `[validatePayrollRecord] field "${key}" should be a number, got ${typeof value} (${String(value)})`,
        );
        return false;
      }
    } else if (typeof value !== 'string') {
      console.warn(
        `[validatePayrollRecord] field "${key}" should be a string, got ${typeof value} (${String(value)})`,
      );
      return false;
    }
  }

  return true;
}

/**
 * Validate every record in an array, warn once per invalid record.
 */
function validatePayrollRecords(records: unknown[]): void {
  for (let i = 0; i < records.length; i++) {
    if (!validatePayrollRecord(records[i])) {
      console.warn(`[validatePayrollRecord] record at index ${i} failed validation`);
    }
  }
}

// ==========================================
// Payroll API Functions
// ==========================================

export async function getPayroll(): Promise<PayrollRecord[]> {
  const data = await apiFetch<MongoDoc[]>('/api/payroll');
  const records = data.map(toAppEntity<PayrollRecord>);
  if (import.meta.env.DEV) {
    validatePayrollRecords(records);
  }
  return records;
}

export async function getPayrollByEmployee(id: string): Promise<PayrollRecord[]> {
  const data = await apiFetch<MongoDoc[]>(`/api/payroll/${id}`);
  const records = data.map(toAppEntity<PayrollRecord>);
  if (import.meta.env.DEV) {
    validatePayrollRecords(records);
  }
  return records;
}

export async function runPayroll(): Promise<PayrollRecord[]> {
  const data = await apiFetch<MongoDoc[]>('/api/payroll/run', {
    method: 'POST',
  });
  const records = data.map(toAppEntity<PayrollRecord>);
  if (import.meta.env.DEV) {
    validatePayrollRecords(records);
  }
  return records;
}

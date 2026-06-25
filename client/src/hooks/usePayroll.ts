import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  getPayroll,
  getPayrollByEmployee,
  runPayroll,
  type PayrollRecord,
} from '../services/apiService';
import { downloadFile, previewFile, downloadBatchFile } from '../utils/api';

export type { PayrollRecord };

/**
 * Hook to retrieve all payroll records
 */
export function usePayroll() {
  return useQuery<PayrollRecord[], Error>({
    queryKey: ['payroll'],
    queryFn: getPayroll,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

/**
 * Hook to retrieve payroll records for a specific employee
 */
export function usePayrollByEmployee(employeeId: string) {
  return useQuery<PayrollRecord[], Error>({
    queryKey: ['payroll', 'employee', employeeId],
    queryFn: () => getPayrollByEmployee(employeeId),
    staleTime: 30_000,
    enabled: !!employeeId,
    placeholderData: keepPreviousData,
  });
}

/**
 * Hook to trigger running payroll
 */
export function useRunPayroll() {
  const queryClient = useQueryClient();

  return useMutation<PayrollRecord[], Error, void>({
    mutationFn: runPayroll,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
  });
}

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Hook to download a specific payslip as a PDF file
 */
export function useDownloadPayslip() {
  return useMutation<
    void,
    Error,
    { employeeId: string; month: string; year: string; employeeName?: string; signal?: AbortSignal }
  >({
    mutationFn: async ({ employeeId, month, year, employeeName, signal }) => {
      const params = new URLSearchParams({ month, year });
      const sanitized = employeeName ? sanitizeName(employeeName) : '';
      const filename = sanitized
        ? `payslip-${sanitized}-${month.toLowerCase()}-${year}.pdf`
        : `payslip-${month.toLowerCase()}-${year}.pdf`;
      await downloadFile(`/payroll/${employeeId}/download?${params.toString()}`, filename, signal);
    },
  });
}

/**
 * Hook to preview a payslip PDF in a new browser tab
 */
export function usePreviewPayslip() {
  return useMutation<
    string,
    Error,
    { employeeId: string; month: string; year: string }
  >({
    mutationFn: async ({ employeeId, month, year }) => {
      const params = new URLSearchParams({ month, year });
      const url = await previewFile(`/payroll/${employeeId}/download?${params.toString()}`);
      return url;
    },
  });
}

/**
 * Hook to batch-download all payslips for a given month/year as a zip file.
 * Accepts an optional department filter.
 * Assumes endpoint: GET /payroll/download-batch?month=X&year=Y&department=Z
 * Confirm exact path with Member B before merging.
 */
export function useDownloadBatchPayslips() {
  return useMutation<
    void,
    Error,
    { month: string; year: string; department?: string }
  >({
    mutationFn: async ({ month, year, department }) => {
      const params = new URLSearchParams({ month, year: String(year) });
      if (department && department !== 'All Departments') {
        params.set('department', department);
      }
      const depSlug = department && department !== 'All Departments'
        ? sanitizeName(department)
        : 'all-departments';
      const filename = `payroll-${depSlug}-${month.toLowerCase()}-${year}.zip`;
      await downloadBatchFile(`/payroll/download-batch?${params.toString()}`, filename);
    },
  });
}

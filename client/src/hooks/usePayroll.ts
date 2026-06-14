import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPayroll,
  getPayrollByEmployee,
  runPayroll,
  type PayrollRecord,
} from '../services/apiService';
import { downloadFile } from '../utils/api';

export type { PayrollRecord };

/**
 * Hook to retrieve all payroll records
 */
export function usePayroll() {
  return useQuery<PayrollRecord[], Error>({
    queryKey: ['payroll'],
    queryFn: getPayroll,
  });
}

/**
 * Hook to retrieve payroll records for a specific employee
 */
export function usePayrollByEmployee(employeeId: string) {
  return useQuery<PayrollRecord[], Error>({
    queryKey: ['payroll', 'employee', employeeId],
    queryFn: () => getPayrollByEmployee(employeeId),
    enabled: !!employeeId,
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

/**
 * Hook to download a specific payslip as a PDF file
 */
export function useDownloadPayslip() {
  return useMutation<void, Error, { employeeId: string; month: string; year: string }>({
    mutationFn: async ({ employeeId, month, year }) => {
      const filename = `payslip-${month.toLowerCase()}-${year}.pdf`;
      await downloadFile(`/payroll/${employeeId}/download`, filename);
    },
  });
}

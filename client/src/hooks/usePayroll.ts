import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPayroll,
  runPayroll,
  downloadPayslip,
  type PayrollRecord,
} from '../services/apiService';

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
 * Hook to download a specific payslip
 * Confined to the specific ID and disabled by default (enabled: false)
 * to allow triggering on-demand via the refetch function.
 */
export function useDownloadPayslip(id: string) {
  return useQuery<unknown, Error>({
    queryKey: ['payroll', id, 'download'],
    queryFn: () => downloadPayslip(id),
    enabled: false,
  });
}

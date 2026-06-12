import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLeaves,
  applyLeave,
  approveLeave,
  rejectLeave,
  type LeaveRequest,
  type ApplyLeaveData,
} from '../services/apiService';

/**
 * Hook to retrieve all leave requests
 */
export function useLeaves() {
  return useQuery<LeaveRequest[], Error>({
    queryKey: ['leaves'],
    queryFn: getLeaves,
  });
}

/**
 * Hook to apply for a new leave request
 */
export function useApplyLeave() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequest, Error, ApplyLeaveData>({
    mutationFn: applyLeave,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
  });
}

/**
 * Hook to approve a leave request by ID
 */
export function useApproveLeave() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequest, Error, string>({
    mutationFn: (id: string) => approveLeave(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['leaves'] });
      void queryClient.invalidateQueries({ queryKey: ['leaves', data.id] });
    },
  });
}

/**
 * Hook to reject a leave request by ID
 */
export function useRejectLeave() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequest, Error, string>({
    mutationFn: (id: string) => rejectLeave(id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['leaves'] });
      void queryClient.invalidateQueries({ queryKey: ['leaves', data.id] });
    },
  });
}

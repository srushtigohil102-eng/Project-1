import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
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
    staleTime: 30_000,
    placeholderData: keepPreviousData,
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

interface ApproveContext {
  previousLeaves: LeaveRequest[] | undefined;
}

/**
 * Hook to approve a leave request by ID with optimistic update
 */
export function useApproveLeave() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequest, Error, string, ApproveContext>({
    mutationFn: (id: string) => approveLeave(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['leaves'] });

      const previousLeaves = queryClient.getQueryData<LeaveRequest[]>(['leaves']);

      queryClient.setQueryData<LeaveRequest[]>(['leaves'], (old) =>
        old?.map((leave) =>
          leave.id === id ? { ...leave, status: 'Approved' as const } : leave,
        ),
      );

      return { previousLeaves };
    },
    onError: (_err, _id, context) => {
      if (context?.previousLeaves) {
        queryClient.setQueryData(['leaves'], context.previousLeaves);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
  });
}

export interface RejectLeaveData {
  id: string;
  reason: string;
}

/**
 * Hook to reject a leave request by ID with a reason
 */
export function useRejectLeave() {
  const queryClient = useQueryClient();

  return useMutation<LeaveRequest, Error, RejectLeaveData>({
    mutationFn: ({ id, reason }: RejectLeaveData) => rejectLeave(id, reason),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['leaves'] });
      void queryClient.invalidateQueries({ queryKey: ['leaves', data.id] });
    },
  });
}

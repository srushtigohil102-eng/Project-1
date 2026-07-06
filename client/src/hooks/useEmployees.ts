import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  type Employee,
  type CreateEmployeeData,
  type UpdateEmployeeData,
} from '../services/apiService';

// Re-export Employee type so existing imports in the codebase don't break
export type { Employee };

/**
 * Hook to retrieve all employees
 */
function useEmployees() {
  return useQuery<Employee[], Error>({
    queryKey: ['employees'],
    queryFn: getEmployees,
    staleTime: 30_000,
    refetchInterval: false,
    placeholderData: keepPreviousData,
  });
}

/**
 * Hook to retrieve a single employee by ID
 */
export function useEmployee(id: string) {
  return useQuery<Employee, Error>({
    queryKey: ['employees', id],
    queryFn: () => getEmployeeById(id),
    staleTime: 30_000,
    refetchInterval: false,
    enabled: !!id,
  });
}

/**
 * Hook to create a new employee
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation<Employee, Error, CreateEmployeeData>({
    mutationFn: createEmployee,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

/**
 * Hook to update an employee by ID
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation<Employee, Error, { id: string; data: UpdateEmployeeData }>({
    mutationFn: ({ id, data }) => updateEmployee(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

/**
 * Hook to delete an employee by ID
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err) => {
      console.error('[useDeleteEmployee] Error deleting employee:', err);
    },
  });
}

export default useEmployees;

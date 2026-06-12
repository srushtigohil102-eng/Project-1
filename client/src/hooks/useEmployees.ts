import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  deleteEmployee,
  type Employee,
  type CreateEmployeeData,
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
    refetchInterval: false,
  });
}

/**
 * Hook to retrieve a single employee by ID
 */
export function useEmployee(id: string) {
  return useQuery<Employee, Error>({
    queryKey: ['employees', id],
    queryFn: () => getEmployeeById(id),
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
 * Hook to delete an employee by ID
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export default useEmployees;

import { useQuery } from '@tanstack/react-query';
import apiFetch from '../utils/api';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
  salary: number;
}

function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => apiFetch<Employee[]>('/employees'),
  });
}

export default useEmployees;

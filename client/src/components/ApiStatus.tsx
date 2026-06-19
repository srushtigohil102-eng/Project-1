import { useQuery } from '@tanstack/react-query';
import apiFetch from '../utils/api';

interface HealthResponse {
  status: string;
}

function ApiStatus() {
  const { isSuccess, isLoading } = useQuery({
    queryKey: ['api-health'],
    queryFn: () => apiFetch<HealthResponse>('/health'),
    refetchInterval: 30000,
    retry: 1,
    staleTime: 0,
  });

  let dotColor: string;
  let label: string;

  if (isLoading) {
    dotColor = 'bg-amber-500';
    label = 'Checking...';
  } else if (isSuccess) {
    dotColor = 'bg-green-500';
    label = 'API Connected';
  } else {
    dotColor = 'bg-red-500';
    label = 'API Offline';
  }

  return (
    <div className="flex items-center gap-1.5 px-4 py-2">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
      <span className="hidden truncate text-xs text-gray-500 md:inline">
        {label}
      </span>
    </div>
  );
}

export default ApiStatus;

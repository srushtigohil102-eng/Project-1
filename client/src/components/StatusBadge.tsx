export type StatusBadgeStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected';

export interface StatusBadgeProps {
  status: StatusBadgeStatus;
}

const STATUS_CONFIG: Record<
  StatusBadgeStatus,
  { label: string; background: string; dot: string }
> = {
  active: {
    label: 'Active',
    background: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
  inactive: {
    label: 'Inactive',
    background: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
  pending: {
    label: 'Pending',
    background: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  approved: {
    label: 'Approved',
    background: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    background: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
};

function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status.toLowerCase() as StatusBadgeStatus] ?? {
    label: status,
    background: 'bg-gray-100 text-gray-700',
    dot: 'bg-gray-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.background}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export default StatusBadge;

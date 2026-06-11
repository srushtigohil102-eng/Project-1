import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

type ActivityType =
  | 'employee'
  | 'leave_request'
  | 'leave_approved'
  | 'payroll'
  | 'leave_rejected';

interface ActivityItem {
  type: ActivityType;
  name: string;
  action: string;
  timeAgo: string;
}

const ACTIVITY_DOT_COLORS: Record<ActivityType, string> = {
  employee: 'bg-blue-500',
  leave_request: 'bg-amber-500',
  leave_approved: 'bg-green-500',
  payroll: 'bg-purple-500',
  leave_rejected: 'bg-red-500',
};

const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    type: 'employee',
    name: 'Rahul Sharma',
    action: 'joined as Backend Developer',
    timeAgo: '2 hours ago',
  },
  {
    type: 'leave_request',
    name: 'Priya Nair',
    action: 'submitted a leave request',
    timeAgo: '4 hours ago',
  },
  {
    type: 'leave_approved',
    name: 'Arjun Mehta',
    action: "'s leave was approved",
    timeAgo: 'Yesterday',
  },
  {
    type: 'payroll',
    name: 'May 2026 payroll',
    action: 'was processed',
    timeAgo: '2 days ago',
  },
  {
    type: 'leave_rejected',
    name: 'Sneha Patel',
    action: "'s leave was rejected",
    timeAgo: '3 days ago',
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

function TrendUpIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: string;
  icon: string;
  accentColor: string;
  iconBgColor: string;
  attention?: boolean;
}

function StatCard({
  label,
  value,
  subtitle,
  trend,
  icon,
  accentColor,
  iconBgColor,
  attention = false,
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${accentColor} ${
        attention ? 'ring-2 ring-amber-200 ring-offset-1' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {value}
          </p>
          {trend && (
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
              <TrendUpIcon />
              {trend}
            </p>
          )}
          {subtitle && (
            <p
              className={`mt-1 text-xs ${attention ? 'font-medium text-amber-700' : 'text-gray-500'}`}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl ${iconBgColor}`}
        >
          <span aria-hidden="true">{icon}</span>
        </div>
      </div>
    </div>
  );
}

interface ActivityRowProps {
  activity: ActivityItem;
  isLast: boolean;
}

function ActivityRow({ activity, isLast }: ActivityRowProps) {
  return (
    <>
      <div className="flex items-start gap-3 px-5 py-4">
        <span
          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${ACTIVITY_DOT_COLORS[activity.type]}`}
          aria-hidden="true"
        />
        <p className="min-w-0 flex-1 text-sm text-gray-700">
          <span className="font-semibold text-gray-900">{activity.name}</span>{' '}
          {activity.action}
        </p>
        <span className="shrink-0 text-xs text-gray-400">{activity.timeAgo}</span>
      </div>
      {!isLast && <div className="mx-5 border-b border-gray-100" />}
    </>
  );
}

interface QuickLinkCardProps {
  title: string;
  subtitle: string;
  icon: string;
  bgColor: string;
  hoverBgColor: string;
  onClick: () => void;
}

function QuickLinkCard({
  title,
  subtitle,
  icon,
  bgColor,
  hoverBgColor,
  onClick,
}: QuickLinkCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left transition-colors ${bgColor} ${hoverBgColor}`}
    >
      <span className="text-2xl" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      <span
        className="shrink-0 text-lg text-gray-500 transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      >
        →
      </span>
    </button>
  );
}

function DashboardPage() {
  const { user, isHRManager } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.name ?? 'there';
  const pendingLeaves = 3;

  const handleAddEmployee = (): void => {
    window.alert('Opening add employee form');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-gradient-to-r from-blue-50 via-sky-50 to-blue-100 px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {getGreeting()}, {displayName}!
        </h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          Here is what is happening at your company today.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Employees"
          value="24"
          trend="+3 this month"
          icon="👥"
          accentColor="border-l-4 border-l-blue-500"
          iconBgColor="bg-blue-100"
        />
        <StatCard
          label="Pending Leaves"
          value={String(pendingLeaves)}
          subtitle="Awaiting approval"
          icon="📋"
          accentColor="border-l-4 border-l-amber-500"
          iconBgColor="bg-amber-100"
          attention={pendingLeaves > 0}
        />
        <StatCard
          label="Departments"
          value="5"
          subtitle="Active departments"
          icon="🏢"
          accentColor="border-l-4 border-l-green-500"
          iconBgColor="bg-green-100"
        />
        <StatCard
          label="Payroll This Month"
          value="₹4,20,000"
          subtitle="June 2026"
          icon="💰"
          accentColor="border-l-4 border-l-purple-500"
          iconBgColor="bg-purple-100"
        />
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Latest updates across your organization
          </p>
        </div>
        <div>
          {RECENT_ACTIVITIES.map((activity, index) => (
            <ActivityRow
              key={`${activity.type}-${activity.name}`}
              activity={activity}
              isLast={index === RECENT_ACTIVITIES.length - 1}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div
          className={`grid grid-cols-1 gap-4 ${isHRManager ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}
        >
          {isHRManager && (
            <QuickLinkCard
              title="Add Employee"
              subtitle="Onboard a new team member"
              icon="➕"
              bgColor="bg-blue-50"
              hoverBgColor="hover:bg-blue-100"
              onClick={handleAddEmployee}
            />
          )}
          <QuickLinkCard
            title="Apply for Leave"
            subtitle="Submit a new leave request"
            icon="📋"
            bgColor="bg-amber-50"
            hoverBgColor="hover:bg-amber-100"
            onClick={() => navigate('/leave')}
          />
          <QuickLinkCard
            title="Download Payslip"
            subtitle="View and download your payslip"
            icon="💰"
            bgColor="bg-green-50"
            hoverBgColor="hover:bg-green-100"
            onClick={() => navigate('/payroll')}
          />
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;

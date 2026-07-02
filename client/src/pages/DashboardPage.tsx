import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useEmployees from '../hooks/useEmployees';
import { useLeaves } from '../hooks/useLeave';
import { usePayroll } from '../hooks/usePayroll';
import { formatTimeAgo, calculateLeaveDays, formatIndianCurrency, calculateNetPay } from '../utils/helpers';
import { showSuccess } from '../utils/toast';

function safeTimestamp(dateStr: string | undefined | null): number {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function safeDate(dateStr: string | undefined | null): Date {
  if (!dateStr) return new Date(0);
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function TrendUpIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
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
    <div className={`rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${accentColor} ${attention ? 'ring-2 ring-amber-200 ring-offset-1' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{value}</p>
          {trend && (
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
              <TrendUpIcon />
              {trend}
            </p>
          )}
          {subtitle && (
            <p className={`mt-1 text-xs ${attention ? 'font-medium text-amber-700' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl ${iconBgColor}`}>
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
        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${ACTIVITY_DOT_COLORS[activity.type]}`} aria-hidden="true" />
        <p className="min-w-0 flex-1 text-sm text-gray-700">
          <span className="truncate font-semibold text-gray-900" title={activity.name}>{activity.name}</span> {activity.action}
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

function QuickLinkCard({ title, subtitle, icon, bgColor, hoverBgColor, onClick }: QuickLinkCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left transition-colors ${bgColor} ${hoverBgColor}`}
    >
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      <span className="shrink-0 text-lg text-gray-500 transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
    </button>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-gradient-to-r from-blue-50 via-sky-50 to-blue-100 px-6 py-8">
        <SkeletonBlock className="h-8 w-64 max-w-full" />
        <SkeletonBlock className="mt-3 h-4 w-80 max-w-full" />
      </section>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-4 h-10 w-16" />
            <SkeletonBlock className="mt-3 h-3 w-28" />
          </div>
        ))}
      </section>
      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <SkeletonBlock className="h-5 w-36" />
          <SkeletonBlock className="mt-2 h-4 w-56" />
        </div>
        <div className="space-y-4 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-10 w-full" />
          ))}
        </div>
      </section>
      <section>
        <SkeletonBlock className="mb-3 h-6 w-32" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}

function DashboardPage() {
  const { user, isHRManager } = useAuth();
  const navigate = useNavigate();

  const { data: employees, isLoading: empLoading, isError: empError } = useEmployees();
  const { data: leaves, isLoading: leaveLoading, isError: leaveError } = useLeaves();
  const { data: payroll, isLoading: payrollLoading, isError: payrollError } = usePayroll();

  const isLoading = empLoading || leaveLoading || payrollLoading;
  const hasPartialError = empError || leaveError || payrollError;

  useEffect(() => {
    document.title = 'Dashboard — HRMS';
  }, []);

  const today = useMemo(() => new Date(), []);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const displayName = user?.name ?? 'there';
  const formattedDate = `${DAY_NAMES[today.getDay()]}, ${today.getDate()} ${MONTH_NAMES[currentMonth]} ${currentYear}`;

  /* ────────────── HR MANAGER computed data ────────────── */

  const totalEmployees = employees?.length ?? 0;

  const employeesThisMonth = useMemo(() => {
    if (!employees) return 0;
    return employees.filter((e) => {
      const d = safeDate(e.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
  }, [employees, currentMonth, currentYear]);

  const pendingLeaves = useMemo(() => {
    if (!leaves) return 0;
    return leaves.filter((l) => l.status === 'Pending').length;
  }, [leaves]);

  const departmentCount = useMemo(() => {
    if (!employees) return 0;
    return new Set(employees.map((e) => e.department.name)).size;
  }, [employees]);

  const payrollThisMonth = useMemo(() => {
    if (!payroll) return 0;
    return payroll
      .filter((r) => r.month === MONTH_NAMES[currentMonth] && r.year === currentYear)
      .reduce((sum, r) => sum + calculateNetPay(r.salaryBreakdown, r.deductionBreakdown), 0);
  }, [payroll, currentMonth, currentYear]);

  const hrActivities = useMemo<ActivityItem[]>(() => {
    const items: Array<{ type: ActivityType; name: string; action: string; timestamp: Date }> = [];

    if (employees) {
      [...employees]
        .sort((a, b) => safeTimestamp(b.createdAt) - safeTimestamp(a.createdAt))
        .slice(0, 3)
        .forEach((e) => {
          items.push({ type: 'employee', name: e.fullName, action: `joined as ${e.role}`, timestamp: safeDate(e.createdAt) });
        });
    }

    if (leaves) {
      [...leaves]
        .filter((l) => l.status === 'Pending')
        .sort((a, b) => safeTimestamp(b.createdAt) - safeTimestamp(a.createdAt))
        .slice(0, 3)
        .forEach((l) => {
          items.push({ type: 'leave_request', name: l.employee.fullName, action: `submitted a ${l.leaveType} request`, timestamp: safeDate(l.createdAt) });
        });
    }

    if (leaves) {
      [...leaves]
        .filter((l) => l.status === 'Approved')
        .sort((a, b) => safeTimestamp(b.createdAt) - safeTimestamp(a.createdAt))
        .slice(0, 3)
        .forEach((l) => {
          items.push({ type: 'leave_approved', name: l.employee.fullName, action: `'s leave was approved`, timestamp: safeDate(l.createdAt) });
        });
    }

    return items
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5)
      .map((item) => ({
        type: item.type,
        name: item.name,
        action: item.action,
        timeAgo: formatTimeAgo(item.timestamp),
      }));
  }, [employees, leaves]);

  const leaveOverview = useMemo(() => {
    if (!leaves) return { approved: 0, pending: 0, rejected: 0 };
    return {
      approved: leaves.filter((l) => l.status === 'Approved' && safeDate(l.createdAt).getMonth() === currentMonth && safeDate(l.createdAt).getFullYear() === currentYear).length,
      pending: leaves.filter((l) => l.status === 'Pending').length,
      rejected: leaves.filter((l) => l.status === 'Rejected' && safeDate(l.createdAt).getMonth() === currentMonth && safeDate(l.createdAt).getFullYear() === currentYear).length,
    };
  }, [leaves, currentMonth, currentYear]);

  const leaveTotal = leaveOverview.approved + leaveOverview.pending + leaveOverview.rejected;

  const departmentBreakdown = useMemo(() => {
    if (!employees) return [];
    const counts: Record<string, number> = {};
    employees.forEach((e) => { counts[e.department.name] = (counts[e.department.name] || 0) + 1; });
    const entries = Object.entries(counts).map(([department, count]) => ({ department, count }));
    entries.sort((a, b) => b.count - a.count);
    const maxCount = entries.length > 0 ? entries[0].count : 1;
    return entries.map((e) => ({ ...e, percentage: (e.count / maxCount) * 100 }));
  }, [employees]);

  const handleAddEmployee = (): void => {
    showSuccess('Opening add employee form');
  };

  /* ────────────── EMPLOYEE computed data ────────────── */

  const employeeRecord = useMemo(() => {
    if (!employees || !user) return null;
    return employees.find((e) => e.id === user.id) ?? null;
  }, [employees, user]);

  const myPendingLeaves = useMemo(() => {
    if (!leaves || !user) return 0;
    return leaves.filter((l) => l.employee.id === user.id && l.status === 'Pending').length;
  }, [leaves, user]);

  const myApprovedLeaveDays = useMemo(() => {
    if (!leaves || !user) return 0;
    const thisYearLeaves = leaves.filter(
      (l) => l.employee.id === user.id && l.status === 'Approved'
    );
    let total = 0;
    for (const l of thisYearLeaves) {
      const from = safeDate(l.startDate);
      const to = safeDate(l.endDate);
      if (from.getFullYear() === currentYear || to.getFullYear() === currentYear) {
        total += calculateLeaveDays(l.startDate, l.endDate);
      }
    }
    return total;
  }, [leaves, user, currentYear]);

  const leaveBalance = 24 - myApprovedLeaveDays;

  const myPayrollThisMonth = useMemo(() => {
    if (!payroll || !user) return null;
    return payroll.find(
      (p) => typeof p.employee === 'object' && p.employee !== null && 'id' in p.employee && p.employee.id === user.id && p.month === MONTH_NAMES[currentMonth] && p.year === currentYear
    ) ?? null;
  }, [payroll, user, currentMonth, currentYear]);

  const yearsAtCompany = useMemo(() => {
    if (!employeeRecord) return 0;
    const start = safeDate(employeeRecord.createdAt);
    const diffMs = today.getTime() - start.getTime();
    return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
  }, [employeeRecord, today]);

  const employeeJoinMonthYear = useMemo(() => {
    if (!employeeRecord) return '';
    const start = safeDate(employeeRecord.createdAt);
    return `${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}`;
  }, [employeeRecord]);

  const employeeActivities = useMemo<ActivityItem[]>(() => {
    const items: Array<{ type: ActivityType; name: string; action: string; timestamp: Date }> = [];

    if (leaves && user) {
      const myLeaves = leaves.filter((l) => l.employee.id === user.id);

      myLeaves
        .filter((l) => l.status === 'Approved')
        .sort((a, b) => safeTimestamp(b.createdAt) - safeTimestamp(a.createdAt))
        .slice(0, 3)
        .forEach((l) => {
          items.push({ type: 'leave_approved', name: 'Your', action: 'leave was approved', timestamp: safeDate(l.createdAt) });
        });

      myLeaves
        .filter((l) => l.status === 'Pending')
        .sort((a, b) => safeTimestamp(b.createdAt) - safeTimestamp(a.createdAt))
        .slice(0, 3)
        .forEach((l) => {
          items.push({ type: 'leave_request', name: 'Your', action: 'leave request is pending', timestamp: safeDate(l.createdAt) });
        });

      myLeaves
        .filter((l) => l.status === 'Rejected')
        .sort((a, b) => safeTimestamp(b.createdAt) - safeTimestamp(a.createdAt))
        .slice(0, 3)
        .forEach((l) => {
          items.push({ type: 'leave_rejected', name: 'Your', action: 'leave was rejected', timestamp: safeDate(l.createdAt) });
        });
    }

    if (payroll && user) {
      const myPayroll = payroll.filter(
        (p) => typeof p.employee === 'object' && p.employee !== null && 'id' in p.employee && p.employee.id === user.id && p.month === MONTH_NAMES[currentMonth] && p.year === currentYear
      );
      myPayroll.forEach((p) => {
        items.push({ type: 'payroll', name: 'Your', action: `payslip is ready for ${p.month} ${p.year}`, timestamp: new Date() });
      });
    }

    return items
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5)
      .map((item) => ({
        type: item.type,
        name: item.name,
        action: item.action,
        timeAgo: formatTimeAgo(item.timestamp),
      }));
  }, [leaves, payroll, user, currentMonth, currentYear]);

  const handleViewProfile = (): void => {
    showSuccess('Opening profile view');
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Warning banner for partial errors */}
      {hasPartialError && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-3">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm font-medium text-yellow-800">
            Some data could not be loaded. Showing partial information.
          </p>
        </div>
      )}

      {/* Welcome Banner */}
      <section className="rounded-xl bg-gradient-to-r from-blue-50 via-sky-50 to-blue-100 px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {getGreeting()}, {displayName}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          {isHRManager
            ? `You have ${pendingLeaves} pending leave${pendingLeaves === 1 ? '' : 's'} to review.`
            : 'Here is a summary of your activity at the company.'}
        </p>
      </section>

      {/* ==================== HR MANAGER VIEW ==================== */}
      {isHRManager ? (
        <>
          {/* Stat Cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Employees"
              value={String(totalEmployees)}
              trend={employeesThisMonth > 0 ? `+${employeesThisMonth} this month` : undefined}
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
              value={String(departmentCount)}
              subtitle="Active departments"
              icon="🏢"
              accentColor="border-l-4 border-l-green-500"
              iconBgColor="bg-green-100"
            />
            <StatCard
              label="Payroll This Month"
              value={`₹${formatIndianCurrency(payrollThisMonth)}`}
              subtitle={`${MONTH_NAMES[currentMonth]} ${currentYear}`}
              icon="💰"
              accentColor="border-l-4 border-l-purple-500"
              iconBgColor="bg-purple-100"
            />
          </section>

          {/* Recent Activity (company-wide) */}
          <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <p className="mt-0.5 text-sm text-gray-500">Latest updates across your organization</p>
            </div>
            <div>
              {hrActivities.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-gray-400">No recent activity to display.</p>
              ) : (
                hrActivities.map((activity, index) => (
                  <ActivityRow
                    key={`${activity.type}-${activity.name}-${index}`}
                    activity={activity}
                    isLast={index === hrActivities.length - 1}
                  />
                ))
              )}
            </div>
          </section>

          {/* HR Manager Insight Cards */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Leave Overview */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Leave Overview (This Month)</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Approved</p>
                  <p className="text-xl font-bold text-green-600">{leaveOverview.approved}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-xl font-bold text-amber-600">{leaveOverview.pending}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rejected</p>
                  <p className="text-xl font-bold text-red-600">{leaveOverview.rejected}</p>
                </div>
              </div>
              {leaveTotal > 0 && (
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                  {leaveOverview.approved > 0 && (
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${(leaveOverview.approved / leaveTotal) * 100}%` }}
                    />
                  )}
                  {leaveOverview.pending > 0 && (
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{ width: `${(leaveOverview.pending / leaveTotal) * 100}%` }}
                    />
                  )}
                  {leaveOverview.rejected > 0 && (
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${(leaveOverview.rejected / leaveTotal) * 100}%` }}
                    />
                  )}
                </div>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Approved</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Pending</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Rejected</span>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Department Breakdown</h3>
              <div className="space-y-3">
                {departmentBreakdown.length === 0 ? (
                  <p className="text-sm text-gray-400">No department data available.</p>
                ) : (
                  departmentBreakdown.map((dept, i) => {
                    const isHighest = i === 0 && departmentBreakdown.length > 1 && dept.count > (departmentBreakdown[1]?.count ?? 0);
                    return (
                      <div key={dept.department}>
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm ${isHighest ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {dept.department}
                            {isHighest && <span className="ml-1.5 text-xs text-blue-600">(most)</span>}
                          </p>
                          <p className={`text-sm ${isHighest ? 'font-bold text-gray-900' : 'text-gray-500'}`}>{dept.count}</p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full transition-all ${isHighest ? 'bg-blue-500' : 'bg-blue-300'}`}
                            style={{ width: `${dept.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* HR Quick Actions */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <QuickLinkCard
                title="Add Employee"
                subtitle="Onboard a new team member"
                icon="➕"
                bgColor="bg-blue-50"
                hoverBgColor="hover:bg-blue-100"
                onClick={handleAddEmployee}
              />
              <QuickLinkCard
                title="Review Leaves"
                subtitle="Approve or reject leave requests"
                icon="📋"
                bgColor="bg-amber-50"
                hoverBgColor="hover:bg-amber-100"
                onClick={() => navigate('/leave')}
              />
              <QuickLinkCard
                title="Run Payroll"
                subtitle="Process monthly payroll"
                icon="💰"
                bgColor="bg-green-50"
                hoverBgColor="hover:bg-green-100"
                onClick={() => navigate('/payroll')}
              />
            </div>
          </section>
        </>
      ) : (
        /* ==================== EMPLOYEE VIEW ==================== */
        <>
          {/* Stat Cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="My Leave Balance"
              value={`${leaveBalance} days`}
              subtitle="of 24 days remaining"
              icon="🏖️"
              accentColor="border-l-4 border-l-blue-500"
              iconBgColor="bg-blue-100"
              attention={leaveBalance <= 5}
            />
            <StatCard
              label="My Pending Requests"
              value={String(myPendingLeaves)}
              subtitle="Awaiting approval"
              icon="📋"
              accentColor="border-l-4 border-l-amber-500"
              iconBgColor="bg-amber-100"
              attention={myPendingLeaves > 0}
            />
            <StatCard
              label="My Salary (This Month)"
              value={myPayrollThisMonth ? `₹${formatIndianCurrency(calculateNetPay(myPayrollThisMonth.salaryBreakdown, myPayrollThisMonth.deductionBreakdown))}` : 'Pending'}
              subtitle={myPayrollThisMonth ? `${MONTH_NAMES[currentMonth]} ${currentYear}` : 'Not yet processed'}
              icon="💰"
              accentColor={`border-l-4 ${myPayrollThisMonth ? 'border-l-green-500' : 'border-l-gray-400'}`}
              iconBgColor={myPayrollThisMonth ? 'bg-green-100' : 'bg-gray-100'}
            />
            <StatCard
              label="Years at Company"
              value={yearsAtCompany >= 1 ? `${yearsAtCompany} year${yearsAtCompany === 1 ? '' : 's'}` : '< 1 year'}
              subtitle={employeeJoinMonthYear ? `Since ${employeeJoinMonthYear}` : undefined}
              icon="🎉"
              accentColor="border-l-4 border-l-purple-500"
              iconBgColor="bg-purple-100"
            />
          </section>

          {/* Employee Activity Feed (own activity only) */}
          <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900">My Activity</h2>
              <p className="mt-0.5 text-sm text-gray-500">Your latest activity in the system</p>
            </div>
            <div>
              {employeeActivities.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-gray-400">No recent activity to display.</p>
              ) : (
                employeeActivities.map((activity, index) => (
                  <ActivityRow
                    key={`${activity.type}-${index}`}
                    activity={activity}
                    isLast={index === employeeActivities.length - 1}
                  />
                ))
              )}
            </div>
          </section>

          {/* Employee Quick Actions */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
              <QuickLinkCard
                title="View My Profile"
                subtitle="Check your personal details"
                icon="👤"
                bgColor="bg-purple-50"
                hoverBgColor="hover:bg-purple-100"
                onClick={handleViewProfile}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default DashboardPage;

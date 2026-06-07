import TopBar from '../components/TopBar';

type StatCardProps = {
  label: string;
  value: string;
  accentClass: string;
};

function StatCard({ label, value, accentClass }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${accentClass}`}
    >
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function DashboardPage() {
  const stats: StatCardProps[] = [
    {
      label: 'Total Employees',
      value: '0',
      accentClass: 'border-l-4 border-l-blue-500',
    },
    {
      label: 'Pending Leaves',
      value: '0',
      accentClass: 'border-l-4 border-l-amber-500',
    },
    {
      label: 'Departments',
      value: '0',
      accentClass: 'border-l-4 border-l-green-500',
    },
    {
      label: 'Payroll This Month',
      value: '₹0',
      accentClass: 'border-l-4 border-l-purple-500',
    },
  ];

  return (
    <div>
      <TopBar title="Dashboard" />
      <div className="p-6 lg:p-8">
      <header className="mb-8">
        <p className="text-sm text-gray-500">
          Welcome back! Here&apos;s what&apos;s happening.
        </p>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recent Activity
        </h2>
        <div className="flex h-40 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-400">No recent activity</p>
        </div>
      </section>
      </div>
    </div>
  );
}

export default DashboardPage;

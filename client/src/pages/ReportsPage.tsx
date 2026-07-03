import { useMemo } from 'react';
import useEmployees from '../hooks/useEmployees';
import { useLeaves } from '../hooks/useLeave';
import { usePayroll } from '../hooks/usePayroll';
import { formatIndianCurrency, calculateGrossPay, calculateTotalDeductions, calculateNetPay } from '../utils/helpers';
import { showSuccess } from '../utils/toast';
import type { Employee } from '../services/apiService';

/* ─────────── helpers ─────────── */

function groupByDepartment(employees: Employee[]) {
  const map = new Map<string, { name: string; total: number; active: number; onLeave: number }>();
  for (const emp of employees) {
    const deptName = emp.department?.name || 'Unassigned';
    if (!map.has(deptName)) {
      map.set(deptName, { name: deptName, total: 0, active: 0, onLeave: 0 });
    }
    const entry = map.get(deptName)!;
    entry.total++;
    if (emp.status === 'Active') entry.active++;
    if (emp.status === 'On Leave') entry.onLeave++;
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

function getMode(values: string[]): string {
  const freq = new Map<string, number>();
  for (const v of values) {
    freq.set(v, (freq.get(v) || 0) + 1);
  }
  let max = 0;
  let mode = '';
  for (const [val, count] of freq) {
    if (count > max) {
      max = count;
      mode = val;
    }
  }
  return mode || 'N/A';
}

/* ─────────── ReportsPage ─────────── */

export default function ReportsPage() {
  const { data: employees, isLoading: empLoading } = useEmployees();
  const { data: leaves, isLoading: leavesLoading } = useLeaves();
  const { data: payroll, isLoading: payrollLoading } = usePayroll();

  /* ── Section 1: Headcount ── */
  const activeEmployees = useMemo(() => employees?.filter((e) => e.status === 'Active') ?? [], [employees]);
  const onLeaveEmployees = useMemo(() => employees?.filter((e) => e.status === 'On Leave') ?? [], [employees]);
  const inactiveEmployees = useMemo(() => employees?.filter((e) => e.status === 'Inactive') ?? [], [employees]);
  const totalHeadcount = employees?.length ?? 0;
  const deptRows = useMemo(() => (employees ? groupByDepartment(employees) : []), [employees]);

  /* ── Section 2: Leave Analytics ── */
  const currentYear = new Date().getFullYear();
  const leavesThisYear = useMemo(
    () => leaves?.filter((l) => new Date(l.createdAt).getFullYear() === currentYear) ?? [],
    [leaves, currentYear],
  );
  const totalRequests = leavesThisYear.length;
  const avgRequestsPerEmployee = totalHeadcount > 0 ? (totalRequests / totalHeadcount).toFixed(1) : '0';
  const mostCommonLeaveType = useMemo(
    () => (leavesThisYear.length > 0 ? getMode(leavesThisYear.map((l) => l.leaveType)) : 'N/A'),
    [leavesThisYear],
  );
  const approvedCount = leavesThisYear.filter((l) => l.status === 'Approved').length;
  const approvalRate = totalRequests > 0 ? Math.round((approvedCount / totalRequests) * 100) : 0;

  const leaveTypeRows = useMemo(() => {
    const map = new Map<string, { type: string; total: number; approved: number; rejected: number; pending: number }>();
    for (const l of leavesThisYear) {
      if (!map.has(l.leaveType)) {
        map.set(l.leaveType, { type: l.leaveType, total: 0, approved: 0, rejected: 0, pending: 0 });
      }
      const entry = map.get(l.leaveType)!;
      entry.total++;
      if (l.status === 'Approved') entry.approved++;
      else if (l.status === 'Rejected') entry.rejected++;
      else entry.pending++;
    }
    return Array.from(map.values());
  }, [leavesThisYear]);

  /* ── Section 3: Payroll Summary ── */
  const currentMonth = new Date().getMonth();
  const currentPayroll = useMemo(
    () => payroll?.filter((p) => p.month === currentMonth && p.year === currentYear) ?? [],
    [payroll, currentMonth, currentYear],
  );
  const totalGross = useMemo(
    () => currentPayroll.reduce((sum, p) => sum + calculateGrossPay(p.salaryBreakdown), 0),
    [currentPayroll],
  );
  const totalDeductions = useMemo(
    () => currentPayroll.reduce((sum, p) => sum + calculateTotalDeductions(p.deductionBreakdown), 0),
    [currentPayroll],
  );
  const totalNet = useMemo(
    () => currentPayroll.reduce((sum, p) => sum + calculateNetPay(p.salaryBreakdown, p.deductionBreakdown), 0),
    [currentPayroll],
  );
  const avgNet = currentPayroll.length > 0 ? totalNet / currentPayroll.length : 0;

  const isLoading = empLoading || leavesLoading || payrollLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Header with Export buttons ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">Company-wide analytics and insights</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => showSuccess('CSV export coming soon')}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => showSuccess('PDF export coming soon')}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 cursor-pointer"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* ═══════════ Section 1: Headcount ═══════════ */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Headcount Overview</h2>
        <p className="mb-6 text-sm text-gray-500">Employee distribution across the company</p>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard label="Total Headcount" value={totalHeadcount.toString()} color="text-gray-900" />
          <MetricCard label="Active" value={activeEmployees.length.toString()} color="text-green-600" />
          <MetricCard label="On Leave" value={onLeaveEmployees.length.toString()} color="text-amber-600" />
          <MetricCard label="Inactive" value={inactiveEmployees.length.toString()} color="text-red-600" />
        </div>

        {deptRows.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">No department data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="pb-3 pr-4">Department</th>
                  <th className="pb-3 pr-4">Headcount</th>
                  <th className="pb-3 pr-4">Active</th>
                  <th className="pb-3 pr-4">On Leave</th>
                  <th className="pb-3">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {deptRows.map((row) => (
                  <tr key={row.name} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">{row.name}</td>
                    <td className="py-3 pr-4 text-gray-700">{row.total}</td>
                    <td className="py-3 pr-4 text-green-700">{row.active}</td>
                    <td className="py-3 pr-4 text-amber-700">{row.onLeave}</td>
                    <td className="py-3 text-gray-700">{totalHeadcount > 0 ? Math.round((row.total / totalHeadcount) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ═══════════ Section 2: Leave Analytics ═══════════ */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Leave Analytics</h2>
        <p className="mb-6 text-sm text-gray-500">Leave request patterns</p>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard label="Total Requests" value={totalRequests.toString()} color="text-gray-900" />
          <MetricCard label="Avg per Employee" value={avgRequestsPerEmployee} color="text-gray-900" />
          <MetricCard label="Most Common Type" value={mostCommonLeaveType} color="text-blue-600" />
          <MetricCard
            label="Approval Rate"
            value={`${approvalRate}%`}
            color={approvalRate >= 70 ? 'text-green-600' : approvalRate >= 40 ? 'text-amber-600' : 'text-red-600'}
          />
        </div>

        {leaveTypeRows.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">No leave data available for this year.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="pb-3 pr-4">Leave Type</th>
                  <th className="pb-3 pr-4">Requests</th>
                  <th className="pb-3 pr-4">Approved</th>
                  <th className="pb-3 pr-4">Rejected</th>
                  <th className="pb-3">Pending</th>
                </tr>
              </thead>
              <tbody>
                {leaveTypeRows.map((row) => (
                  <tr key={row.type} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">{row.type}</td>
                    <td className="py-3 pr-4 text-gray-700">{row.total}</td>
                    <td className="py-3 pr-4 text-green-700">{row.approved}</td>
                    <td className="py-3 pr-4 text-red-700">{row.rejected}</td>
                    <td className="py-3 text-amber-700">{row.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ═══════════ Section 3: Payroll Summary ═══════════ */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Payroll Summary</h2>
        <p className="mb-6 text-sm text-gray-500">
          {new Date().toLocaleString('default', { month: 'long' })} {currentYear} compensation overview
        </p>

        {currentPayroll.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">No payroll data available for this month.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard label="Total Gross Payroll" value={`₹${formatIndianCurrency(totalGross)}`} color="text-gray-900" />
            <MetricCard label="Total Deductions" value={`₹${formatIndianCurrency(totalDeductions)}`} color="text-red-600" />
            <MetricCard label="Total Net Disbursement" value={`₹${formatIndianCurrency(totalNet)}`} color="text-green-600" />
            <MetricCard label="Avg Net per Employee" value={`₹${formatIndianCurrency(Math.round(avgNet))}`} color="text-blue-600" />
          </div>
        )}
      </section>
    </div>
  );
}

/* ─────────── MetricCard inline component ─────────── */

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`mt-1 text-xl font-bold tracking-tight ${color}`}>{value}</p>
    </div>
  );
}

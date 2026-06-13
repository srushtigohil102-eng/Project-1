import { useEffect, useState, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import {
  useLeaves,
  useApproveLeave,
  useRejectLeave,
} from '../hooks/useLeave';
import { calculateLeaveDays, formatDate } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import ApplyLeaveModal from '../components/ApplyLeaveModal';

// ==========================================
// Custom Icons (SVGs) for Premium UI
// ==========================================

function CalendarIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ClockIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SpinnerIcon({ className = 'h-4 w-4 animate-spin' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// ==========================================
// Sub-Components
// ==========================================

function SkeletonTable({ columnsCount }: { columnsCount: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse border-b border-gray-100 last:border-0">
          {Array.from({ length: columnsCount }).map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
              <div className="h-4 bg-gray-200 rounded-sm w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface EmptyStateProps {
  message: string;
  submessage?: string;
}

function EmptyState({ message, submessage = 'No requests to display' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border border-gray-200 shadow-xs">
      <div className="rounded-full bg-gray-50 p-4 mb-4 text-gray-400">
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-gray-900">{message}</h3>
      <p className="mt-1 text-sm text-gray-500">{submessage}</p>
    </div>
  );
}

// ==========================================
// Main Component
// ==========================================

function LeavePage() {
  const { user, isHRManager } = useAuth();
  
  // Queries & Mutations
  const { data: leaves = [], isLoading, error, refetch } = useLeaves();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();

  // Component local states
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all');
  const [managerTab, setManagerTab] = useState<'all' | 'pending' | 'processed'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Action notifications/errors
  const [actionError, setActionError] = useState<string | null>(null);

  // Update Page Title
  useEffect(() => {
    document.title = isHRManager ? 'Leave Management — HRMS' : 'My Leave Requests — HRMS';
  }, [isHRManager]);

  // Handle mutation error side-effects
  useEffect(() => {
    if (approveMutation.error) {
      setActionError(`Approve failed: ${approveMutation.error.message}`);
    } else if (rejectMutation.error) {
      setActionError(`Reject failed: ${rejectMutation.error.message}`);
    }
  }, [approveMutation.error, rejectMutation.error]);

  // Stats Calculations
  const employeeStats = useMemo(() => {
    const employeeLeaves = leaves.filter((l) => l.employeeId === user?.id);
    const total = employeeLeaves.length;
    const approved = employeeLeaves.filter((l) => l.status === 'approved').length;
    const pending = employeeLeaves.filter((l) => l.status === 'pending').length;
    const rejected = employeeLeaves.filter((l) => l.status === 'rejected').length;
    return { total, approved, pending, rejected };
  }, [leaves, user?.id]);

  const managerStats = useMemo(() => {
    const total = leaves.length;
    const approved = leaves.filter((l) => l.status === 'approved').length;
    const pending = leaves.filter((l) => l.status === 'pending').length;
    const rejected = leaves.filter((l) => l.status === 'rejected').length;
    return { total, approved, pending, rejected };
  }, [leaves]);

  // Filtering for table display
  const displayedLeaves = useMemo(() => {
    if (isHRManager) {
      return leaves;
    }
    return leaves.filter((l) => l.employeeId === user?.id);
  }, [leaves, isHRManager, user?.id]);

  const filteredLeaves = useMemo(() => {
    if (isHRManager) {
      if (managerTab === 'pending') {
        return displayedLeaves.filter((l) => l.status === 'pending');
      }
      if (managerTab === 'processed') {
        return displayedLeaves.filter((l) => l.status === 'approved' || l.status === 'rejected');
      }
      return displayedLeaves;
    } else {
      if (activeTab === 'pending') {
        return displayedLeaves.filter((l) => l.status === 'pending');
      }
      if (activeTab === 'approved') {
        return displayedLeaves.filter((l) => l.status === 'approved');
      }
      return displayedLeaves;
    }
  }, [displayedLeaves, isHRManager, activeTab, managerTab]);



  const isMutatingAny = approveMutation.isPending || rejectMutation.isPending;

  return (
    <>
      {/* Top Header Section */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isHRManager ? 'Leave Management' : 'My Leave Requests'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isHRManager ? 'Review and manage leave requests' : 'Track your leave history'}
          </p>
        </div>
        {!isHRManager && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Apply for Leave
          </button>
        )}
      </header>

      {/* Mutation Error Notification */}
      {actionError && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            className="text-red-500 hover:text-red-700 font-semibold"
            onClick={() => setActionError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Stats */}
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xs hover:shadow-sm transition-shadow">
          <div className={`rounded-lg p-3 ${isHRManager ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {isHRManager ? 'Total Requests' : 'Total Leaves Taken'}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {isHRManager ? managerStats.total : employeeStats.total}
            </p>
          </div>
        </div>

        {/* Approved Stats */}
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xs hover:shadow-sm transition-shadow">
          <div className="rounded-lg bg-green-50 p-3 text-green-600">
            <CheckIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Approved</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {isHRManager ? managerStats.approved : employeeStats.approved}
            </p>
          </div>
        </div>

        {/* Pending Stats */}
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xs hover:shadow-sm transition-shadow">
          <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
            <ClockIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {isHRManager ? managerStats.pending : employeeStats.pending}
            </p>
          </div>
        </div>

        {/* Rejected Stats */}
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xs hover:shadow-sm transition-shadow">
          <div className="rounded-lg bg-red-50 p-3 text-red-600">
            <XIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rejected</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {isHRManager ? managerStats.rejected : employeeStats.rejected}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {isHRManager ? (
            <>
              <button
                type="button"
                onClick={() => setManagerTab('all')}
                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors cursor-pointer ${
                  managerTab === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                All Requests
              </button>
              <button
                type="button"
                onClick={() => setManagerTab('pending')}
                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors cursor-pointer ${
                  managerTab === 'pending'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Pending Approval
              </button>
              <button
                type="button"
                onClick={() => setManagerTab('processed')}
                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors cursor-pointer ${
                  managerTab === 'processed'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Processed
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'pending'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('approved')}
                className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'approved'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Approved
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Main Table Content */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-xs">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {isHRManager ? (
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">From</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">To</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Days</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            ) : (
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">From Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">To Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Days</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied On</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <SkeletonTable columnsCount={isHRManager ? 8 : 7} />
            ) : error ? (
              <tr>
                <td colSpan={isHRManager ? 8 : 7} className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center justify-center text-red-600 gap-2">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="font-semibold text-sm">Error loading leave requests: {error.message}</span>
                    <button
                      type="button"
                      onClick={() => void refetch()}
                      className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                </td>
              </tr>
            ) : filteredLeaves.length === 0 ? (
              <tr>
                <td colSpan={isHRManager ? 8 : 7} className="px-6 py-10">
                  <EmptyState
                    message={
                      isHRManager
                        ? managerTab === 'all'
                          ? 'No leave requests found'
                          : managerTab === 'pending'
                          ? 'No pending requests'
                          : 'No processed requests'
                        : activeTab === 'all'
                        ? 'No leave requests found'
                        : activeTab === 'pending'
                        ? 'No pending requests'
                        : 'No approved requests'
                    }
                    submessage={
                      isHRManager
                        ? managerTab === 'all'
                          ? 'There are no leave requests in the system.'
                          : managerTab === 'pending'
                          ? 'All employee requests have been processed!'
                          : 'There are no approved or rejected requests.'
                        : activeTab === 'all'
                        ? 'You have not applied for any leave yet.'
                        : activeTab === 'pending'
                        ? 'All your requests have been processed!'
                        : 'None of your requests are currently approved.'
                    }
                  />
                </td>
              </tr>
            ) : (
              filteredLeaves.map((leave) => {
                if (isHRManager) {
                  const isApproving = approveMutation.isPending && approveMutation.variables === leave.id;
                  const isRejecting = rejectMutation.isPending && rejectMutation.variables === leave.id;
                  const isPending = leave.status === 'pending';

                  return (
                    <tr key={leave.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar name={leave.employeeName} size="md" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{leave.employeeName}</div>
                            <div className="text-xs text-gray-500">ID: {leave.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {leave.leaveType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(leave.fromDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(leave.toDate)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {calculateLeaveDays(leave.fromDate, leave.toDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={leave.status} />
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={!isPending || isMutatingAny}
                            onClick={() => approveMutation.mutate(leave.id)}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {isApproving && <SpinnerIcon className="h-3 w-3 animate-spin text-emerald-700" />}
                            {isApproving ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            type="button"
                            disabled={!isPending || isMutatingAny}
                            onClick={() => rejectMutation.mutate(leave.id)}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {isRejecting && <SpinnerIcon className="h-3 w-3 animate-spin text-rose-700" />}
                            {isRejecting ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                } else {
                  return (
                    <tr key={leave.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {leave.leaveType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(leave.fromDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(leave.toDate)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {calculateLeaveDays(leave.fromDate, leave.toDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={leave.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(leave.createdAt)}
                      </td>
                    </tr>
                  );
                }
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - Apply for Leave (Employee View only) */}
      <ApplyLeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default LeavePage;

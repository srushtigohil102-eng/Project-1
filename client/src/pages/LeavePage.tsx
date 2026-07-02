import { useEffect, useState, useMemo, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import {
  useLeaves,
  useApproveLeave,
  useRejectLeave,
} from '../hooks/useLeave';
import { formatDate, formatTimeAgo } from '../utils/helpers';
import StatusBadge, { type StatusBadgeStatus } from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import ApplyLeaveModal from '../components/ApplyLeaveModal';
import RejectLeaveModal from '../components/RejectLeaveModal';
import type { LeaveRequest } from '../services/apiService';
import { showSuccess, showError } from '../utils/toast';

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

function ChevronLeftIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
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

function CalendarDaysIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function TagIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function InfoIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

interface TabButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  activeColor: 'blue' | 'emerald';
  onClick: () => void;
}

function TabButton({ label, count, isActive, activeColor, onClick }: TabButtonProps) {
  const activeBorderColor = activeColor === 'blue' ? 'border-blue-600 text-blue-600' : 'border-emerald-600 text-emerald-600';
  const inactiveStyle = 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-2 ${
        isActive ? activeBorderColor : inactiveStyle
      }`}
    >
      {label}
      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
        isActive
          ? activeColor === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
          : 'bg-gray-100 text-gray-500'
      }`}>
        {count}
      </span>
    </button>
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
// Helpers
// ==========================================

function isInCurrentMonth(dateStr: string): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && date.getFullYear() === currentYear && date.getMonth() === currentMonth;
}

// ==========================================
// Main Component
// ==========================================

function LeavePage() {
  const { user, isHRManager } = useAuth();
  
  // Queries & Mutations
  const { data: leaves = [], isLoading, error, refetch, dataUpdatedAt } = useLeaves();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();

  // Component local states
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all');
  const [managerTab, setManagerTab] = useState<'all' | 'pending' | 'processed'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Reject modal state
  const [rejectModalState, setRejectModalState] = useState<{
    isOpen: boolean;
    leaveId: string;
    employeeName: string;
    leaveDates: string;
  }>({ isOpen: false, leaveId: '', employeeName: '', leaveDates: '' });

  // Detail panel state
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  // Update Page Title
  useEffect(() => {
    document.title = isHRManager ? 'Leave Management — HRMS' : 'My Leave Requests — HRMS';
  }, [isHRManager]);



  // Stats Calculations
  const employeeStats = useMemo(() => {
    const employeeLeaves = leaves.filter((l) => l.employee.id === user?.id);
    const total = employeeLeaves.length;
    const approved = employeeLeaves.filter((l) => l.status === 'Approved').length;
    const pending = employeeLeaves.filter((l) => l.status === 'Pending').length;
    const rejected = employeeLeaves.filter((l) => l.status === 'Rejected').length;
    return { total, approved, pending, rejected };
  }, [leaves, user?.id]);

  const managerStats = useMemo(() => {
    const thisMonthLeaves = leaves.filter((l) => isInCurrentMonth(l.createdAt));
    const total = thisMonthLeaves.length;
    const approved = thisMonthLeaves.filter((l) => l.status === 'Approved').length;
    const pending = thisMonthLeaves.filter((l) => l.status === 'Pending').length;
    const rejected = thisMonthLeaves.filter((l) => l.status === 'Rejected').length;
    return { total, approved, pending, rejected };
  }, [leaves]);

  // Filtering for table display
  const displayedLeaves = useMemo(() => {
    if (isHRManager) {
      return leaves;
    }
    return leaves.filter((l) => l.employee.id === user?.id);
  }, [leaves, isHRManager, user?.id]);

  const filteredLeaves = useMemo(() => {
    if (isHRManager) {
      if (managerTab === 'pending') {
        return displayedLeaves.filter((l) => l.status === 'Pending');
      }
      if (managerTab === 'processed') {
        return displayedLeaves.filter((l) => l.status === 'Approved' || l.status === 'Rejected');
      }
      return displayedLeaves;
    } else {
      if (activeTab === 'pending') {
        return displayedLeaves.filter((l) => l.status === 'Pending');
      }
      if (activeTab === 'approved') {
        return displayedLeaves.filter((l) => l.status === 'Approved');
      }
      return displayedLeaves;
    }
  }, [displayedLeaves, isHRManager, activeTab, managerTab]);

  // Detail panel handlers
  const handleRowClick = useCallback((leave: LeaveRequest): void => {
    setSelectedLeave(leave);
    setIsDetailPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback((): void => {
    setIsDetailPanelOpen(false);
    setTimeout(() => { setSelectedLeave(null); }, 300);
  }, []);

  // Reject modal open
  const openRejectModal = useCallback((leave: LeaveRequest): void => {
    const dateRange = `${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}`;
    setRejectModalState({
      isOpen: true,
      leaveId: leave.id,
      employeeName: leave.employee.fullName,
      leaveDates: dateRange,
    });
  }, []);

  const closeRejectModal = useCallback((): void => {
    setRejectModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

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

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Stats */}
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xs hover:shadow-sm transition-shadow">
          <div className={`rounded-lg p-3 ${isHRManager ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {isHRManager ? 'Total Requests This Month' : 'Total Leaves Taken'}
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
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {isHRManager ? 'Approved This Month' : 'Approved'}
            </p>
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
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {isHRManager ? 'Pending' : 'Pending'}
            </p>
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
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {isHRManager ? 'Rejected This Month' : 'Rejected'}
            </p>
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
              <TabButton
                label="All Requests"
                count={displayedLeaves.length}
                isActive={managerTab === 'all'}
                activeColor="blue"
                onClick={() => setManagerTab('all')}
              />
              <TabButton
                label="Pending Approval"
                count={displayedLeaves.filter((l) => l.status === 'Pending').length}
                isActive={managerTab === 'pending'}
                activeColor="blue"
                onClick={() => setManagerTab('pending')}
              />
              <TabButton
                label="Processed"
                count={displayedLeaves.filter((l) => l.status === 'Approved' || l.status === 'Rejected').length}
                isActive={managerTab === 'processed'}
                activeColor="blue"
                onClick={() => setManagerTab('processed')}
              />
            </>
          ) : (
            <>
              <TabButton
                label="All"
                count={displayedLeaves.length}
                isActive={activeTab === 'all'}
                activeColor="emerald"
                onClick={() => setActiveTab('all')}
              />
              <TabButton
                label="Pending"
                count={displayedLeaves.filter((l) => l.status === 'Pending').length}
                isActive={activeTab === 'pending'}
                activeColor="emerald"
                onClick={() => setActiveTab('pending')}
              />
              <TabButton
                label="Approved"
                count={displayedLeaves.filter((l) => l.status === 'Approved').length}
                isActive={activeTab === 'approved'}
                activeColor="emerald"
                onClick={() => setActiveTab('approved')}
              />
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
                <th scope="col" className="min-w-[200px] px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                <th scope="col" className="min-w-[130px] px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
                <th scope="col" className="min-w-[110px] px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</th>
                <th scope="col" className="min-w-[110px] px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</th>
                <th scope="col" className="min-w-[70px] px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Days</th>
                <th scope="col" className="min-w-[200px] px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                <th scope="col" className="min-w-[100px] px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="min-w-[160px] px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            ) : (
              <tr>
                <th scope="col" className="min-w-[130px] px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
                <th scope="col" className="min-w-[110px] px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</th>
                <th scope="col" className="min-w-[110px] px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</th>
                <th scope="col" className="min-w-[70px] px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Days</th>
                <th scope="col" className="min-w-[200px] px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                <th scope="col" className="min-w-[100px] px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="min-w-[110px] px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied On</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <SkeletonTable columnsCount={isHRManager ? 8 : 7} />
            ) : error ? (
              <tr key="error">
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
            ) : displayedLeaves.length === 0 ? (
              <tr key="empty-all">
                <td colSpan={isHRManager ? 8 : 7} className="px-6 py-10">
                  <EmptyState
                    message={
                      isHRManager
                        ? 'No leave requests have been submitted yet'
                        : 'You have not submitted any leave requests yet'
                    }
                    submessage={
                      isHRManager
                        ? 'Leave requests will appear here once employees submit them.'
                        : 'Use the "Apply for Leave" button above to submit your first request.'
                    }
                  />
                </td>
              </tr>
            ) : filteredLeaves.length === 0 ? (
              <tr key="empty-filtered">
                <td colSpan={isHRManager ? 8 : 7} className="px-6 py-10">
                  <EmptyState
                    message={
                      isHRManager
                        ? managerTab === 'pending'
                          ? 'No pending leaves found'
                          : managerTab === 'processed'
                          ? 'No processed leaves found'
                          : 'No leaves found'
                        : activeTab === 'pending'
                        ? 'No pending leaves found'
                        : activeTab === 'approved'
                        ? 'No approved leaves found'
                        : 'No leaves found'
                    }
                    submessage="Try selecting a different tab."
                  />
                </td>
              </tr>
            ) : (
              filteredLeaves.map((leave) => {
                if (isHRManager) {
                  const isApproving = approveMutation.isPending && approveMutation.variables === leave.id;
                  const isRejecting = rejectMutation.isPending && rejectMutation.variables?.id === leave.id;
                  const isPending = leave.status === 'Pending';

                  return (
                    <tr
                      key={leave.id}
                      onClick={() => handleRowClick(leave)}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="max-w-48 truncate px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar name={leave.employee.fullName} size="md" />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-gray-900" title={leave.employee.fullName}>{leave.employee.fullName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {leave.leaveType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(leave.startDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(leave.endDate)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {leave.numberOfDays}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={leave.status.toLowerCase() as StatusBadgeStatus} />
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isMutatingAny}
                              onClick={() => {
                                approveMutation.mutate(leave.id, {
                                  onSuccess: () => {
                                    showSuccess('Leave approved successfully');
                                  },
                                  onError: () => {
                                    showError('Failed to approve leave');
                                  },
                                });
                              }}
                              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {isApproving && <SpinnerIcon className="h-3 w-3 animate-spin text-emerald-700" />}
                              {isApproving ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              disabled={isMutatingAny}
                              onClick={() => openRejectModal(leave)}
                              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {isRejecting && <SpinnerIcon className="h-3 w-3 animate-spin text-rose-700" />}
                              {isRejecting ? 'Rejecting...' : 'Reject'}
                            </button>
                          </div>
                          ) : leave.status === 'Approved' ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            Rejected
                          </span>
                        )}
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
                        {formatDate(leave.startDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(leave.endDate)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {leave.numberOfDays}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={leave.status.toLowerCase() as StatusBadgeStatus} />
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

      {!isLoading && leaves.length > 0 && (
        <p className="mt-3 text-right text-xs text-gray-400">
          Last updated: {formatTimeAgo(new Date(dataUpdatedAt))}
        </p>
      )}

      {/* Modal - Apply for Leave (Employee View only) */}
      <ApplyLeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Modal - Reject Leave (HR Manager View) */}
      <RejectLeaveModal
        isOpen={rejectModalState.isOpen}
        onClose={closeRejectModal}
        leaveId={rejectModalState.leaveId}
        employeeName={rejectModalState.employeeName}
        leaveDates={rejectModalState.leaveDates}
      />

      {/* Slide-in Detail Panel */}
      <div
        className={`fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isDetailPanelOpen && selectedLeave ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClosePanel}
      >
        <div
          className={`relative h-full w-full max-w-md bg-white p-6 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
            isDetailPanelOpen && selectedLeave ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedLeave && (
            <>
              {/* Panel Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
                <h3 className="text-lg font-bold text-gray-900">Leave Details</h3>
                <button
                  type="button"
                  onClick={handleClosePanel}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto mt-6 space-y-6">
                {/* Employee Info */}
                <div className="flex items-center gap-4">
                  <Avatar name={selectedLeave.employee.fullName} size="lg" />
                  <div>
                    <p className="text-base font-bold text-gray-900">{selectedLeave.employee.fullName}</p>
                  </div>
                </div>

                {/* Leave Type */}
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 border border-gray-100">
                  <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                    <TagIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{selectedLeave.leaveType}</p>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 border border-gray-100">
                    <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                      <CalendarDaysIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{formatDate(selectedLeave.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 border border-gray-100">
                    <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                      <CalendarDaysIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{formatDate(selectedLeave.endDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 border border-emerald-100">
                  <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700">
                    <ClockIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Duration</p>
                    <p className="text-sm font-bold text-emerald-800 mt-0.5">
                      {selectedLeave.numberOfDays} working day{selectedLeave.numberOfDays !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reason for Leave</p>
                  <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedLeave.reason}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</p>
                  <StatusBadge status={selectedLeave.status.toLowerCase() as StatusBadgeStatus} />
                </div>

                {/* Applied On */}
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 border border-gray-100">
                  <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600">
                    <InfoIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied On</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{formatDate(selectedLeave.createdAt)}</p>
                  </div>
                </div>

                {/* Rejection Reason (if rejected) */}
                {selectedLeave.status === 'Rejected' && selectedLeave.rejectionReason && (
                  <div>
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Rejection Reason</p>
                    <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                      <p className="text-sm text-red-800 leading-relaxed whitespace-pre-wrap">{selectedLeave.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Close Button */}
              <div className="pt-4 border-t border-gray-100 shrink-0 mt-6">
                <button
                  type="button"
                  onClick={handleClosePanel}
                  className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default LeavePage;

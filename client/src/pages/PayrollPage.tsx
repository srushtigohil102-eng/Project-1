import { useEffect, useState, useMemo, useCallback, useRef, Fragment } from 'react';
import useAuth from '../hooks/useAuth';
import {
  usePayroll,
  useRunPayroll,
  useDownloadPayslip,
  usePreviewPayslip,
  useDownloadBatchPayslips,
  type PayrollRecord,
} from '../hooks/usePayroll';
import {
  showSuccess,
  showError,
  showLoading,
  showLoadingSuccess,
  showLoadingError,
} from '../utils/toast';
import {
  formatIndianCurrency,
  formatTimeAgo,
  calculateGrossPay,
  calculateNetPay,
  calculateTotalDeductions,
} from '../utils/helpers';
import useEmployees from '../hooks/useEmployees';
import { BatchNotImplementedError } from '../utils/api';
import Avatar from '../components/Avatar';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function SpinnerIcon({ className = 'h-4 w-4 animate-spin' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function PayrollPage() {
  const { user, isHRManager } = useAuth();
  const { data: payrollData, isLoading, isError, error, refetch, dataUpdatedAt } = usePayroll();
  const runPayrollMutation = useRunPayroll();
  const downloadPayslipMutation = useDownloadPayslip();
  const previewPayslipMutation = usePreviewPayslip();
  const downloadBatchMutation = useDownloadBatchPayslips();
  const employeesQuery = useEmployees();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showConfirm, setShowConfirm] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [timeoutMessage, setTimeoutMessage] = useState<string | null>(null);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const getDepartmentName = (record: PayrollRecord): string => {
    const dept = record.employee?.department;
    if (!dept) return '—';
    if (typeof dept === 'string') return '—';
    if (typeof dept === 'object' && dept.name) return dept.name;
    return '—';
  };

  const abortControllerRef = useRef<AbortController | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.title = 'Payroll — HRMS';
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
    };
  }, []);

  const canGoNext = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    return selectedYear < currentYear ||
      (selectedYear === currentYear && selectedMonth < currentMonth);
  }, [selectedMonth, selectedYear]);

  const goPrevMonth = useCallback(() => {
    setSelectedMonth((prev) => {
      if (prev === 0) {
        setSelectedYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, [setSelectedMonth, setSelectedYear]);

  const goNextMonth = useCallback(() => {
    if (!canGoNext) return;
    setSelectedMonth((prev) => {
      if (prev === 11) {
        setSelectedYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, [canGoNext, setSelectedMonth, setSelectedYear]);

  const filteredRecords = useMemo<PayrollRecord[]>(() => {
    if (!payrollData) return [];
    return payrollData.filter(
      (r) => r.month === selectedMonth + 1 && r.year === selectedYear
    );
  }, [payrollData, selectedMonth, selectedYear]);

  const visibleRecords = useMemo(() => {
    if (isHRManager) return filteredRecords;
    return filteredRecords.filter((r) => r.employee.id === user?.id);
  }, [filteredRecords, isHRManager, user?.id]);

  const totalPayroll = useMemo(
    () => filteredRecords.reduce((sum, r) => sum + calculateNetPay(r.salaryBreakdown, r.deductionBreakdown), 0),
    [filteredRecords]
  );

  const employeesPaid = filteredRecords.length;
  const processingStatus = employeesPaid > 0 ? 'Completed' : 'Pending';

  const hasPayrollData = useMemo(
    () => Array.isArray(payrollData) && payrollData.length > 0,
    [payrollData],
  );

  const isBusyId = useMemo(
    () => downloadingId ?? previewingId,
    [downloadingId, previewingId],
  );

  const departments = useMemo(() => {
    if (!employeesQuery.data) return ['All Departments'];
    const deps = new Set(employeesQuery.data.map((e) => e.department.name).filter(Boolean));
    return ['All Departments', ...Array.from(deps).sort()];
  }, [employeesQuery.data]);

  const departmentEmployeeCount = useMemo(() => {
    if (selectedDepartment === 'All Departments') return filteredRecords.length;
    return filteredRecords.filter((r) => getDepartmentName(r) === selectedDepartment).length;
  }, [filteredRecords, selectedDepartment]);

  const handleDownload = useCallback((record: PayrollRecord) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setDownloadingId(record.id);
    setTimeoutMessage(null);

    warningTimerRef.current = setTimeout(() => {
      setTimeoutMessage('Still generating, this may take a moment...');
    }, 10_000);

    timeoutTimerRef.current = setTimeout(() => {
      abortController.abort();
      setTimeoutMessage('Download timed out. Please try again.');
    }, 30_000);

    downloadPayslipMutation.mutate(
      {
        payrollId: record.id,
        employeeName: record.employee.fullName,
        signal: abortController.signal,
      },
      {
        onSuccess: () => {
          showSuccess('Payslip downloaded successfully');
          setTimeoutMessage(null);
        },
        onError: (err) => {
          if (err.name === 'AbortError') return;
          showError(err.message || 'Failed to download payslip');
          setTimeoutMessage(null);
        },
        onSettled: () => {
          setDownloadingId(null);
          if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
            warningTimerRef.current = null;
          }
          if (timeoutTimerRef.current) {
            clearTimeout(timeoutTimerRef.current);
            timeoutTimerRef.current = null;
          }
          abortControllerRef.current = null;
        },
      }
    );
  }, [downloadPayslipMutation]);

  const handlePreview = useCallback((record: PayrollRecord) => {
    setPreviewingId(record.id);
    previewPayslipMutation.mutate(
      {
        payrollId: record.id,
      },
      {
        onSuccess: () => {
          showSuccess('Payslip preview opened');
        },
        onError: (err) => {
          showError(err.message || 'Failed to preview payslip');
        },
        onSettled: () => {
          setPreviewingId(null);
        },
      }
    );
  }, [previewPayslipMutation]);

  const handleBatchConfirm = useCallback(() => {
    setShowBatchConfirm(false);
    setShowDepartmentDropdown(false);

    const toastId = showLoading(
      `Generating batch payslips for ${selectedDepartment === 'All Departments' ? 'all departments' : selectedDepartment}...`,
    );

    downloadBatchMutation.mutate(
      {
        month: MONTH_NAMES[selectedMonth],
        year: String(selectedYear),
        department: selectedDepartment === 'All Departments' ? undefined : selectedDepartment,
      },
      {
        onSuccess: () => {
          showLoadingSuccess(toastId, 'Batch payslips downloaded successfully');
        },
        onError: (err) => {
          if (err instanceof BatchNotImplementedError) {
            showLoadingError(toastId, err.message);
            return;
          }
          showLoadingError(toastId, err.message || 'Batch download failed');
        },
      },
    );
  }, [downloadBatchMutation, selectedMonth, selectedYear, selectedDepartment]);

  const handleRunPayroll = useCallback(() => {
    const toastId = showLoading(
      `Running payroll for ${MONTH_NAMES[selectedMonth]} ${selectedYear}...`
    );
    runPayrollMutation.mutate(undefined, {
      onSuccess: () => {
        showLoadingSuccess(
          toastId,
          `Payroll for ${MONTH_NAMES[selectedMonth]} ${selectedYear} completed`
        );
        setShowConfirm(false);
      },
      onError: (err) => {
        showLoadingError(toastId, err.message || 'Failed to run payroll');
      },
    });
  }, [runPayrollMutation, selectedMonth, selectedYear]);

  const currentMonthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;

  function renderSkeletonRows() {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl bg-white p-4 border border-gray-100 animate-pulse">
            <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
            <div className="min-w-[160px] space-y-1.5">
              <div className="h-3 w-32 rounded bg-gray-200" />
              <div className="h-2.5 w-20 rounded bg-gray-200" />
            </div>
            <div className="ml-auto flex items-center gap-6">
              <div className="h-3 w-14 rounded bg-gray-200" />
              <div className="h-3 w-14 rounded bg-gray-200" />
              <div className="h-3 w-14 rounded bg-gray-200" />
              <div className="h-3 w-14 rounded bg-gray-200" />
              <div className="h-6 w-20 rounded bg-gray-200" />
              <div className="h-8 w-24 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderErrorState() {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-12">
        <svg className="h-10 w-10 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <p className="text-sm font-semibold text-red-700 mb-1">Failed to load payroll data</p>
        <p className="text-xs text-red-500 mb-4">{error?.message || 'An unexpected error occurred.'}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  function renderEmptyState() {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-12">
        <svg className="h-10 w-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
        </svg>
        <p className="text-sm font-semibold text-gray-700 mb-1">No payroll records found</p>
        <p className="text-xs text-gray-400">
          {isHRManager
            ? 'Click Run Payroll to process salaries for this month.'
            : 'No payslips available for this period.'}
        </p>
      </div>
    );
  }

  function renderMonthNotProcessedState() {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-6 py-12">
        <svg className="h-10 w-10 text-amber-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-semibold text-amber-700 mb-1">
          No payroll has been processed for {currentMonthLabel} yet
        </p>
        <p className="text-xs text-amber-500">
          {isHRManager
            ? 'Click Run Payroll to generate it.'
            : 'Please wait for HR to process payroll for this period.'}
        </p>
        {isHRManager && (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition-colors cursor-pointer"
          >
            Run Payroll
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isHRManager ? 'Payroll' : 'My Payslips'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isHRManager ? 'Manage employee compensation' : 'View and download your payslips'}
        </p>
      </header>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goPrevMonth}
            className="flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="min-w-[140px] text-center text-base font-bold text-gray-900 select-none">
            {currentMonthLabel}
          </span>
          <button
            type="button"
            onClick={goNextMonth}
            disabled={!canGoNext}
            className="flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {isHRManager && (
          <div className="flex items-center gap-3">
            {employeesPaid > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDepartmentDropdown((prev) => !prev)}
                  className="rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  Download All Payslips
                  <svg className="ml-1.5 inline-block h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showDepartmentDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDepartmentDropdown(false)}
                    />
                    <div className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      {departments.map((dep) => (
                        <button
                          key={dep}
                          type="button"
                          onClick={() => {
                            setSelectedDepartment(dep);
                            setShowDepartmentDropdown(false);
                            setShowBatchConfirm(true);
                          }}
                          className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                            dep === selectedDepartment
                              ? 'bg-blue-50 font-semibold text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {dep}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Run Payroll
            </button>
          </div>
        )}
      </div>

      {isHRManager && employeesPaid > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Payroll Amount</p>
            <p className="text-xl font-bold text-gray-900">₹{formatIndianCurrency(totalPayroll)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Employees Paid</p>
            <p className="text-xl font-bold text-gray-900">{employeesPaid}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Processing Status</p>
            <p className={`text-xl font-bold ${processingStatus === 'Completed' ? 'text-green-600' : 'text-amber-600'}`}>
              {processingStatus}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        renderSkeletonRows()
      ) : isError ? (
        renderErrorState()
      ) : hasPayrollData && filteredRecords.length === 0 ? (
        renderMonthNotProcessedState()
      ) : visibleRecords.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-xl border border-gray-200 bg-white shadow-xs">
          <table className="min-w-[600px] w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="min-w-[200px] px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                {isHRManager && <th className="min-w-[120px] px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>}
                <th className="min-w-[100px] px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic</th>
                <th className="min-w-[100px] px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Allowances</th>
                <th className="min-w-[100px] px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Deductions</th>
                <th className="min-w-[100px] px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Pay</th>
                <th className="min-w-[100px] px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                {!isHRManager && <th className="min-w-[160px] px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Payslip</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleRecords.map((record) => {
                const grossPay = calculateGrossPay(record.salaryBreakdown);
                const totalDeductions = calculateTotalDeductions(record.deductionBreakdown);
                const netPay = calculateNetPay(record.salaryBreakdown, record.deductionBreakdown);
                const isExpanded = expandedRowId === record.id;

                const statusStyles: Record<string, string> = {
                  Processed: 'bg-green-100 text-green-700',
                  Paid: 'bg-blue-100 text-blue-700',
                  Pending: 'bg-amber-100 text-amber-700',
                };
                const statusDotStyles: Record<string, string> = {
                  Processed: 'bg-green-500',
                  Paid: 'bg-blue-500',
                  Pending: 'bg-amber-500',
                };

                return (
                  <Fragment key={record.id}>
                    <tr
                      onClick={() => setExpandedRowId(isExpanded ? null : record.id)}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={record.employee.fullName} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900" title={record.employee.fullName}>{record.employee.fullName}</p>
                          </div>
                        </div>
                      </td>
                      {isHRManager && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {getDepartmentName(record)}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right text-sm text-gray-900 font-medium">
                        ₹{formatIndianCurrency(record.salaryBreakdown.basic)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900 font-medium">
                        ₹{formatIndianCurrency(grossPay - record.salaryBreakdown.basic)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-red-600 font-medium">
                        ₹{formatIndianCurrency(totalDeductions)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-green-600 font-bold">
                        ₹{formatIndianCurrency(netPay)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[record.status] ?? 'bg-gray-100 text-gray-700'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusDotStyles[record.status] ?? 'bg-gray-500'}`} />
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          {downloadingId === record.id ? (
                            <div className="flex flex-col items-center gap-1">
                              <button
                                type="button"
                                disabled
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white opacity-50 cursor-not-allowed"
                              >
                                <SpinnerIcon className="h-3.5 w-3.5 animate-spin text-white" />
                                Downloading...
                              </button>
                              {timeoutMessage && (
                                <span className="text-xs text-amber-600 max-w-40">{timeoutMessage}</span>
                              )}
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDownload(record)}
                                disabled={isBusyId === record.id}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePreview(record)}
                                disabled={isBusyId === record.id}
                                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                {previewingId === record.id && <LoadingSpinner size="sm" />}
                                {previewingId === record.id ? 'Loading...' : 'Preview'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50/60">
                        <td colSpan={isHRManager ? 8 : 7} className="px-4 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Salary Breakdown</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between"><span className="text-gray-600">Basic</span><span className="font-medium">₹{formatIndianCurrency(record.salaryBreakdown.basic)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">HRA</span><span className="font-medium">₹{formatIndianCurrency(record.salaryBreakdown.hra)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">DA</span><span className="font-medium">₹{formatIndianCurrency(record.salaryBreakdown.da)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">TA</span><span className="font-medium">₹{formatIndianCurrency(record.salaryBreakdown.ta)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Medical</span><span className="font-medium">₹{formatIndianCurrency(record.salaryBreakdown.medicalAllowance)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Special</span><span className="font-medium">₹{formatIndianCurrency(record.salaryBreakdown.specialAllowance)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Bonus</span><span className="font-medium">₹{formatIndianCurrency(record.salaryBreakdown.bonus)}</span></div>
                                <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold"><span className="text-gray-800">Gross Pay</span><span className="text-gray-900">₹{formatIndianCurrency(grossPay)}</span></div>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Deductions</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between"><span className="text-gray-600">Tax</span><span className="font-medium text-red-600">₹{formatIndianCurrency(record.deductionBreakdown.tax)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">PF</span><span className="font-medium text-red-600">₹{formatIndianCurrency(record.deductionBreakdown.providentFund)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Professional Tax</span><span className="font-medium text-red-600">₹{formatIndianCurrency(record.deductionBreakdown.professionalTax)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Insurance</span><span className="font-medium text-red-600">₹{formatIndianCurrency(record.deductionBreakdown.insurance)}</span></div>
                                <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold"><span className="text-gray-800">Total Deductions</span><span className="text-red-600">₹{formatIndianCurrency(totalDeductions)}</span></div>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Attendance</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between"><span className="text-gray-600">Working Days</span><span className="font-medium">{record.totalWorkingDays}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Present</span><span className="font-medium text-green-600">{record.presentDays}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Absent</span><span className="font-medium text-red-600">{record.absentDays}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Leave</span><span className="font-medium text-amber-600">{record.leaveDays}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Holiday</span><span className="font-medium text-blue-600">{record.holidayDays}</span></div>
                                <div className="flex justify-between border-t border-gray-200 pt-1 font-bold text-green-700"><span>Net Pay</span><span>₹{formatIndianCurrency(netPay)}</span></div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        title="Run Payroll"
        message={
          <>
            <p>Run payroll for <strong>{currentMonthLabel}</strong>?</p>
            <p className="mt-1 text-xs text-gray-400">This will process salaries for all active employees.</p>
          </>
        }
        confirmText="Run Payroll"
        confirmColor="blue"
        onConfirm={handleRunPayroll}
        onCancel={() => setShowConfirm(false)}
        isLoading={runPayrollMutation.isPending}
      />

      <ConfirmDialog
        isOpen={showBatchConfirm}
        title="Download Payslips"
        message={
          <>
            <p>
              Download payslips for <strong>{departmentEmployeeCount} employees</strong> in{' '}
              <strong>{selectedDepartment}</strong>?
            </p>
            <p className="mt-1 text-xs text-gray-400">This may take a moment.</p>
          </>
        }
        confirmText="Download All"
        confirmColor="blue"
        onConfirm={handleBatchConfirm}
        onCancel={() => setShowBatchConfirm(false)}
        isLoading={downloadBatchMutation.isPending}
      />

      {!isLoading && payrollData && (
        <p className="mt-3 text-right text-xs text-gray-400">
          Last updated: {formatTimeAgo(new Date(dataUpdatedAt))}
        </p>
      )}
    </>
  );
}

export default PayrollPage;

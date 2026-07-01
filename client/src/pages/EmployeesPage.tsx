import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import AddEmployeeModal from '../components/AddEmployeeModal';
import LoadingSpinner from '../components/LoadingSpinner';
import useAuth from '../hooks/useAuth';
import useEmployees, {
  useDeleteEmployee,
  type Employee,
} from '../hooks/useEmployees';
import { showSuccess, showError } from '../utils/toast';
import { formatTimeAgo } from '../utils/helpers';

type DepartmentFilter = string;
type SortField = 'name' | 'salary' | 'status' | null;
type SortOrder = 'asc' | 'desc';

const SKELETON_ROW_COUNT = 5;
const PAGE_SIZE = 8;
const MAX_VISIBLE_PAGES = 5;

function getVisiblePageNumbers(
  currentPage: number,
  totalPages: number,
): number[] {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  let start = currentPage - Math.floor(MAX_VISIBLE_PAGES / 2);
  let end = start + MAX_VISIBLE_PAGES - 1;

  if (start < 1) {
    start = 1;
    end = MAX_VISIBLE_PAGES;
  }

  if (end > totalPages) {
    end = totalPages;
    start = totalPages - MAX_VISIBLE_PAGES + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function formatSalary(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function mapStatus(status: string): 'active' | 'inactive' | 'pending' {
  const lower = status.toLowerCase();
  if (lower === 'active' || lower === 'on leave') return 'active';
  if (lower === 'inactive') return 'inactive';
  return 'pending';
}

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="relative min-w-0 flex-1">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <SearchIcon />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-3 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
}

interface DepartmentSelectProps {
  value: DepartmentFilter;
  onChange: (value: DepartmentFilter) => void;
  options: string[];
}

function DepartmentSelect({ value, onChange, options }: DepartmentSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-52"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

interface SkeletonRowProps {
  showActions: boolean;
}

function SkeletonRow({ showActions }: SkeletonRowProps) {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-44 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-4 py-4">
        <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
      </td>
      {showActions && (
        <td className="px-4 py-4">
          <div className="flex gap-2">
            <div className="h-8 w-14 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        </td>
      )}
    </tr>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-red-50 px-6 py-16 text-center shadow-sm">
      <span className="text-3xl" aria-hidden="true">
        ✕
      </span>
      <h2 className="mt-4 text-lg font-semibold text-red-800">
        Failed to load employees
      </h2>
      <p className="mt-2 max-w-md text-sm text-red-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}

interface EmptyStateProps {
  isHRManager: boolean;
  onAddEmployee: () => void;
}

function EmptyState({ isHRManager, onAddEmployee }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-4xl">
        👥
      </div>
      <h2 className="mt-6 text-lg font-semibold text-gray-900">
        No employees found
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Try adjusting your search or filters
      </p>
      {isHRManager && (
        <button
          type="button"
          onClick={onAddEmployee}
          className="mt-6 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer"
        >
          Add your first employee
        </button>
      )}
    </div>
  );
}

interface EmployeeRowProps {
  employee: Employee;
  isHRManager: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onViewDetails: (employee: Employee) => void;
  isDeleting: boolean;
  disableActions: boolean;
}

function EmployeeRow({
  employee,
  isHRManager,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onViewDetails,
  isDeleting,
  disableActions,
}: EmployeeRowProps) {
  return (
    <tr className={`border-b border-gray-100 transition-colors even:bg-gray-50/40 hover:bg-blue-50/60 ${isSelected ? 'bg-blue-50/80' : 'bg-white'}`}>
      {isHRManager && (
        <td className="px-3 py-4 w-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(employee.id)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </td>
      )}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={employee.fullName} />
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => onViewDetails(employee)}
              className="truncate font-medium text-gray-900 hover:text-blue-600 hover:underline text-left focus:outline-none cursor-pointer"
            >
              {employee.fullName}
            </button>
            <p className="truncate text-sm text-gray-500">{employee.email}</p>
          </div>
        </div>
      </td>
      <td className="max-w-[150px] truncate px-4 py-4 text-gray-700" title={employee.department.name}>{employee.department.name}</td>
      <td className="max-w-32 truncate px-4 py-4 text-gray-700" title={employee.designation}>{employee.designation}</td>
      <td className="px-4 py-4">
        <StatusBadge status={mapStatus(employee.status)} />
      </td>
      <td className="px-4 py-4 font-medium text-gray-900">
        {formatSalary(employee.salary)}
      </td>
      {isHRManager && (
        <td className="px-4 py-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(employee)}
              disabled={disableActions}
              className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-blue-400 cursor-pointer"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(employee)}
              disabled={disableActions}
              className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-red-400 cursor-pointer"
            >
              {isDeleting && <LoadingSpinner size="sm" className="text-white" />}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function PaginationBar({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: PaginationBarProps) {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const visiblePages = getVisiblePageNumbers(currentPage, totalPages);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="flex flex-col gap-4 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between bg-white">
      <p className="text-sm text-gray-600">
        Showing {startIndex + 1} to {endIndex} of {totalCount} employees
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          <span aria-hidden="true">←</span>
          Previous
        </button>

        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          Next
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

function LastUpdated({ dataUpdatedAt }: { dataUpdatedAt: number | undefined }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!dataUpdatedAt) return null;

  return (
    <p className="mt-3 text-right text-xs text-gray-400">
      Last updated: {formatTimeAgo(new Date(dataUpdatedAt))}
    </p>
  );
}

function EmployeesPage() {
  const { isHRManager } = useAuth();
  const { data: employees, isLoading, isError, error, refetch, dataUpdatedAt } =
    useEmployees();
  const deleteMutation = useDeleteEmployee();

  useEffect(() => {
    document.title = 'Employees — HRMS';
  }, []);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState<DepartmentFilter>(
    'All Departments',
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Bulk selection state
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Add employee modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Slide-in drawer details state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    employeeId: string | null;
  }>({ isOpen: false, title: '', message: '', employeeId: null });

  const deletingIdRef = useRef<string | null>(null);

  const departmentOptions = useMemo(() => {
    if (!employees) return ['All Departments'];
    const deps = new Set(employees.map((e) => e.department.name));
    return ['All Departments', ...Array.from(deps).sort()];
  }, [employees]);

  const hasActiveFilters =
    search.trim().length > 0 || department !== 'All Departments';

  const filteredEmployees = useMemo(() => {
    if (!employees) {
      return [];
    }

    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee.fullName.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query);

      const matchesDepartment =
        department === 'All Departments' ||
        employee.department.name.toLowerCase() === department.toLowerCase();

      return matchesSearch && matchesDepartment;
    });
  }, [employees, search, department]);

  const sortedEmployees = useMemo(() => {
    if (!filteredEmployees) {
      return [];
    }
    if (!sortField) {
      return filteredEmployees;
    }

    return [...filteredEmployees].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortField === 'name') {
        aValue = a.fullName.toLowerCase();
        bValue = b.fullName.toLowerCase();
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredEmployees, sortField, sortOrder]);

  const totalCount = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const effectivePage = Math.min(currentPage, totalPages);
  const startIndex = (effectivePage - 1) * PAGE_SIZE;
  const paginatedEmployees = sortedEmployees.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  const allVisibleSelected = useMemo(
    () => paginatedEmployees.every((e) => selectedEmployees.has(e.id)),
    [paginatedEmployees, selectedEmployees],
  );

  const handleSelectAll = useCallback((): void => {
    setSelectedEmployees((prev) => {
      const next = new Set(prev);
      for (const e of paginatedEmployees) {
        if (allVisibleSelected) next.delete(e.id);
        else next.add(e.id);
      }
      return next;
    });
  }, [paginatedEmployees, allVisibleSelected]);

  const handleSelectOne = useCallback((id: string): void => {
    setSelectedEmployees((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDeselectAll = useCallback((): void => {
    setSelectedEmployees(new Set());
  }, []);

  const handleBulkDelete = useCallback((): void => {
    setBulkDeleteOpen(true);
  }, []);

  const handleConfirmBulkDelete = useCallback(async (): Promise<void> => {
    const ids = Array.from(selectedEmployees);
    let failed = 0;
    for (const id of ids) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        failed++;
      }
    }
    if (failed === 0) {
      showSuccess(`${ids.length} employee${ids.length !== 1 ? 's' : ''} deleted`);
    } else {
      showError(`${failed} employee${failed !== 1 ? 's' : ''} failed to delete`);
    }
    setSelectedEmployees(new Set());
    setBulkDeleteOpen(false);
  }, [selectedEmployees, deleteMutation]);

  const exportSelected = useCallback((): void => {
    showSuccess('Export feature coming soon');
  }, []);

  const handleSearchChange = useCallback((value: string): void => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const handleDepartmentChange = useCallback((value: DepartmentFilter): void => {
    setDepartment(value);
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback((): void => {
    setSearch('');
    setDepartment('All Departments');
    setCurrentPage(1);
  }, []);

  const handleAddEmployee = useCallback((): void => {
    setIsAddModalOpen(true);
  }, []);

  const handleEdit = useCallback((employee: Employee): void => {
    showSuccess(`Edit employee: ${employee.fullName}`);
  }, []);

  const handleDelete = useCallback((employee: Employee): void => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Employee',
      message: `Are you sure you want to delete ${employee.fullName}? This action cannot be undone.`,
      employeeId: employee.id,
    });
  }, []);

  const handleConfirmDelete = useCallback((): void => {
    const id = confirmState.employeeId;
    if (!id) return;

    deletingIdRef.current = id;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        showSuccess('Employee deleted successfully');
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        deletingIdRef.current = null;
      },
      onError: () => {
        showError('Failed to delete employee');
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        deletingIdRef.current = null;
      },
    });
  }, [confirmState.employeeId, deleteMutation]);

  const handleCancelDelete = useCallback((): void => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleViewDetails = useCallback((employee: Employee): void => {
    setSelectedEmployee(employee);
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback((): void => {
    setIsPanelOpen(false);
    // Let the animation finish before removing the details
    setTimeout(() => {
      setSelectedEmployee(null);
    }, 300);
  }, []);

  const handleSort = useCallback((field: 'name' | 'salary' | 'status') => {
    setSortField((prevField) => {
      if (prevField === field) {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        return field;
      }
      setSortOrder('asc');
      return field;
    });
  }, []);

  const columnCount = isHRManager ? 7 : 5;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your team members</p>
        </div>

          {isHRManager && (
          <button
            type="button"
            data-testid="add-employee-btn"
            onClick={handleAddEmployee}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer"
          >
            <PlusIcon />
            Add Employee
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={handleSearchChange} />
          <DepartmentSelect value={department} onChange={handleDepartmentChange} options={departmentOptions} />
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-gray-500">
              {totalCount} {totalCount === 1 ? 'result' : 'results'} found
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 cursor-pointer"
            >
              Clear filters ✕
            </button>
          </div>
        )}
      </div>

      {isHRManager && selectedEmployees.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-blue-800">
              {selectedEmployees.size} employee{selectedEmployees.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportSelected}
              className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Export Selected
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Deselect All
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {isError ? (
        <ErrorState
          message={error?.message ?? 'An unexpected error occurred.'}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-100">
                <tr>
                  {isHRManager && (
                    <th className="px-3 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected && selectedEmployees.size > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                  )}
                  <th
                    onClick={() => handleSort('name')}
                    className="min-w-[200px] px-4 py-3 text-xs font-semibold tracking-wide text-gray-600 uppercase cursor-pointer select-none hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Employee
                      {sortField === 'name' && (
                        <span className="text-sm font-bold text-gray-500">
                          {sortOrder === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="min-w-[150px] px-4 py-3 text-xs font-semibold tracking-wide text-gray-600 uppercase">
                    Department
                  </th>
                  <th className="min-w-[140px] px-4 py-3 text-xs font-semibold tracking-wide text-gray-600 uppercase">
                    Designation
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="min-w-[100px] px-4 py-3 text-xs font-semibold tracking-wide text-gray-600 uppercase cursor-pointer select-none hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sortField === 'status' && (
                        <span className="text-sm font-bold text-gray-500">
                          {sortOrder === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('salary')}
                    className="min-w-[120px] px-4 py-3 text-xs font-semibold tracking-wide text-gray-600 uppercase cursor-pointer select-none hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Salary
                      {sortField === 'salary' && (
                        <span className="text-sm font-bold text-gray-500">
                          {sortOrder === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  {isHRManager && (
                    <th className="min-w-[140px] px-4 py-3 text-xs font-semibold tracking-wide text-gray-600 uppercase">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading &&
                  Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
                    <SkeletonRow key={index} showActions={isHRManager} />
                  ))}

                {!isLoading && filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={columnCount}>
                      <EmptyState
                        isHRManager={isHRManager}
                        onAddEmployee={handleAddEmployee}
                      />
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  paginatedEmployees.map((employee) => (
                    <EmployeeRow
                      key={employee.id}
                      employee={employee}
                      isHRManager={isHRManager}
                      isSelected={selectedEmployees.has(employee.id)}
                      onSelect={handleSelectOne}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onViewDetails={handleViewDetails}
                      isDeleting={
                        deleteMutation.isPending &&
                        deleteMutation.variables === employee.id
                      }
                      disableActions={deleteMutation.isPending}
                    />
                  ))}
              </tbody>
            </table>
          </div>

                  {!isLoading && totalCount > 0 && (
            <PaginationBar
              currentPage={effectivePage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          )}
          <LastUpdated dataUpdatedAt={dataUpdatedAt} />
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Delete"
        confirmColor="red"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        isOpen={bulkDeleteOpen}
        title="Delete Selected Employees"
        message={`Are you sure you want to delete ${selectedEmployees.size} selected employee${selectedEmployees.size !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete All"
        confirmColor="red"
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
        isLoading={false}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          void refetch();
        }}
      />

      {/* Slide-in Detail Panel */}
      <div
        className={`fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isPanelOpen && selectedEmployee
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClosePanel}
      >
        <div
          className={`relative h-full w-full max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out ${
            isPanelOpen && selectedEmployee ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedEmployee && (
            <>
              {/* Close Button & Title */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Employee Profile
                </h2>
                <button
                  type="button"
                  onClick={handleClosePanel}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none cursor-pointer"
                  aria-label="Close panel"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto py-6">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold bg-blue-600 text-white shadow-md border-4 border-white ring-4 ring-blue-100">
                    {selectedEmployee.fullName
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((w) => w[0].toUpperCase())
                      .join('')}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    {selectedEmployee.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedEmployee.designation}</p>
                  <div className="mt-3">
                    <StatusBadge status={mapStatus(selectedEmployee.status)} />
                  </div>
                </div>

                <div className="space-y-4 border-t border-gray-100 pt-6">
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Email Address
                    </span>
                    <span className="mt-1 block text-sm font-medium text-gray-900">
                      {selectedEmployee.email}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Department
                    </span>
                    <span className="mt-1 block text-sm font-medium text-gray-900">
                      {selectedEmployee.department.name}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Designation
                    </span>
                    <span className="mt-1 block text-sm font-medium text-gray-900">
                      {selectedEmployee.designation}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Salary
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-gray-900 text-lg">
                      {formatSalary(selectedEmployee.salary)}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Join Date
                    </span>
                    <span className="mt-1 block text-sm font-medium text-gray-900">
                      {selectedEmployee.createdAt
                        ? new Intl.DateTimeFormat('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }).format(new Date(selectedEmployee.createdAt))
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-100 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    showSuccess(
                      `Edit feature coming soon for ${selectedEmployee.fullName}`,
                    );
                  }}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                >
                  Edit Employee
                </button>
                <button
                  type="button"
                  onClick={handleClosePanel}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
                >
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

export default EmployeesPage;

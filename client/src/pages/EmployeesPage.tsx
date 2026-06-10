import { useEffect, useMemo, useState } from 'react';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import useAuth from '../hooks/useAuth';
import useEmployees, { type Employee } from '../hooks/useEmployees';

const DEPARTMENT_OPTIONS = [
  'All Departments',
  'Engineering',
  'Design',
  'HR',
  'Finance',
  'Marketing',
] as const;

type DepartmentFilter = (typeof DEPARTMENT_OPTIONS)[number];

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
}

function DepartmentSelect({ value, onChange }: DepartmentSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DepartmentFilter)}
      className="w-full shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-52"
    >
      {DEPARTMENT_OPTIONS.map((option) => (
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
        className="mt-6 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
          className="mt-6 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

function EmployeeRow({
  employee,
  isHRManager,
  onEdit,
  onDelete,
}: EmployeeRowProps) {
  return (
    <tr className="border-b border-gray-100 bg-white transition-colors even:bg-gray-50/40 hover:bg-blue-50/60">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={employee.name} />
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900">{employee.name}</p>
            <p className="truncate text-sm text-gray-500">{employee.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-gray-700">{employee.department}</td>
      <td className="px-4 py-4 text-gray-700">{employee.role}</td>
      <td className="px-4 py-4">
        <StatusBadge status={employee.status} />
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
              className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(employee)}
              className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            >
              Delete
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
    <div className="flex flex-col gap-4 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-600">
        Showing {startIndex + 1} to {endIndex} of {totalCount} employees
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span aria-hidden="true">←</span>
          Previous
        </button>

        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
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
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

function EmployeesPage() {
  const { isHRManager } = useAuth();
  const { data: employees, isLoading, isError, error, refetch } =
    useEmployees();

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState<DepartmentFilter>(
    'All Departments',
  );
  const [currentPage, setCurrentPage] = useState(1);

  const hasActiveFilters =
    search.trim().length > 0 || department !== 'All Departments';

  useEffect(() => {
    setCurrentPage(1);
  }, [search, department]);

  const handleClearFilters = (): void => {
    setSearch('');
    setDepartment('All Departments');
  };

  const handleAddEmployee = (): void => {
    window.alert('Add Employee form coming soon');
  };

  const handleEdit = (employee: Employee): void => {
    window.alert(`Edit employee: ${employee.name}`);
  };

  const handleDelete = (employee: Employee): void => {
    window.alert(`Delete employee: ${employee.name}`);
  };

  const filteredEmployees = useMemo(() => {
    if (!employees) {
      return [];
    }

    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query);

      const matchesDepartment =
        department === 'All Departments' ||
        employee.department.toLowerCase() === department.toLowerCase();

      return matchesSearch && matchesDepartment;
    });
  }, [employees, search, department]);

  const totalCount = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const effectivePage = Math.min(currentPage, totalPages);
  const startIndex = (effectivePage - 1) * PAGE_SIZE;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  const columnCount = isHRManager ? 6 : 5;

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
            onClick={handleAddEmployee}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <PlusIcon />
            Add Employee
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} />
          <DepartmentSelect value={department} onChange={setDepartment} />
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-gray-500">
              {totalCount} {totalCount === 1 ? 'result' : 'results'} found
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Clear filters ✕
            </button>
          </div>
        )}
      </div>

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
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-600 uppercase">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-600 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-600 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-600 uppercase">
                    Salary
                  </th>
                  {isHRManager && (
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-600 uppercase">
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
                      onEdit={handleEdit}
                      onDelete={handleDelete}
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
        </div>
      )}
    </>
  );
}

export default EmployeesPage;

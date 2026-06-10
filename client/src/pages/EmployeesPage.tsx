import { useMemo, useState } from 'react';
import useEmployees, { type Employee } from '../hooks/useEmployees';

function StatusBadge({ status }: { status: Employee['status'] }) {
  const isActive = status === 'active';

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isActive
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-600'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

function EmployeesPage() {
  const { data: employees, isLoading, isError, error } = useEmployees();
  const [search, setSearch] = useState('');

  const filteredEmployees = useMemo(() => {
    if (!employees) {
      return [];
    }

    const query = search.trim().toLowerCase();
    if (!query) {
      return employees;
    }

    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.department.toLowerCase().includes(query) ||
        employee.role.toLowerCase().includes(query),
    );
  }, [employees, search]);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your team members</p>
      </header>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:max-w-sm"
        />
        <button
          type="button"
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Employee
        </button>
      </div>

      {isError && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Department
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  Loading employees...
                </td>
              </tr>
            )}

            {!isLoading && !isError && filteredEmployees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  {search.trim() ? 'No employees match your search' : 'No employees found'}
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-gray-100 bg-white last:border-b-0 even:bg-gray-50/50"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{employee.name}</p>
                    <p className="text-xs text-gray-500">{employee.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{employee.department}</td>
                  <td className="px-4 py-3 text-gray-700">{employee.role}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={employee.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default EmployeesPage;

import TopBar from '../components/TopBar';

function EmployeesPage() {
  return (
    <div>
      <TopBar title="Employees" />
      <div className="p-6 lg:p-8">
      <header className="mb-6">
        <p className="text-sm text-gray-500">Manage your team members</p>
      </header>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
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
            <tr className="bg-white even:bg-gray-50/50">
              <td
                colSpan={5}
                className="px-4 py-12 text-center text-gray-400"
              >
                No employees found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

export default EmployeesPage;

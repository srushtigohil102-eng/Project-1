function PayrollPage() {
  const currentMonth = new Date().toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage employee compensation
          </p>
        </header>
        <button
          type="button"
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Run Payroll
        </button>
      </div>

      <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm">
        <span className="font-medium text-gray-500">Month:</span>
        <span className="font-semibold text-gray-900">{currentMonth}</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Employee
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Basic Salary
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Allowances
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Deductions
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Net Pay
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Payslip
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white even:bg-gray-50/50">
              <td
                colSpan={6}
                className="px-4 py-12 text-center text-gray-400"
              >
                No payroll records found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default PayrollPage;

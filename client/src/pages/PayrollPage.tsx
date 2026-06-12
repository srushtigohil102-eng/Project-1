import { useEffect } from 'react';

function PayrollPage() {
  useEffect(() => {
    document.title = 'Payroll — HRMS';
  }, []);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
        <p className="mt-1 text-sm text-gray-500">
          View payslips and payroll records
        </p>
      </header>

      <div className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
        <p className="text-sm text-gray-400">Payroll coming soon</p>
      </div>
    </>
  );
}

export default PayrollPage;

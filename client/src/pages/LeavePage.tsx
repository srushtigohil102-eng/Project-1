import { useState } from 'react';
import TopBar from '../components/TopBar';

type LeaveTab = 'my-leaves' | 'all-requests';

function LeavePage() {
  const [activeTab, setActiveTab] = useState<LeaveTab>('my-leaves');

  return (
    <div>
      <TopBar title="Leave Management" />
      <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header>
          <p className="text-sm text-gray-500">
            Track and manage leave requests
          </p>
        </header>
        <button
          type="button"
          className="shrink-0 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Apply for Leave
        </button>
      </div>

      <div className="mb-6 flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('my-leaves')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'my-leaves'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Leaves
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('all-requests')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'all-requests'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Requests
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Employee
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Leave Type
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">From</th>
              <th className="px-4 py-3 font-semibold text-gray-700">To</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white even:bg-gray-50/50">
              <td
                colSpan={6}
                className="px-4 py-12 text-center text-gray-400"
              >
                No leave requests found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

export default LeavePage;

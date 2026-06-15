import { useState } from 'react';

const WEEK_1_ITEMS = [
  { done: true, label: 'Vite React 19 TypeScript setup' },
  { done: true, label: 'Tailwind CSS v4 configured' },
  { done: true, label: 'React Router v6 routing' },
  { done: true, label: 'Sidebar Layout with navigation' },
  { done: true, label: 'Login page with JWT auth' },
  { done: true, label: 'useAuth and ProtectedRoute' },
  { done: true, label: 'Employee table with search filter' },
  { done: true, label: 'React Query configured' },
  { done: true, label: 'GitHub CI pipeline green' },
];

const WEEK_2_ITEMS = [
  { done: true, label: 'Leave Management UI complete' },
  { done: true, label: 'Apply Leave modal working' },
  { done: true, label: 'HR Manager approve/reject working' },
  { done: true, label: 'Multi-step onboarding form complete' },
  { done: true, label: 'Payslip download working' },
  { done: true, label: 'Dashboard connected to real data' },
  { done: true, label: 'Toast notifications working' },
  { done: true, label: 'API error handling improved' },
];

function ChecklistGroup({
  title,
  items,
}: {
  title: string;
  items: { done: boolean; label: string }[];
}) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-xs text-gray-700">
            <span className="mt-0.5 shrink-0">{item.done ? '☑' : '☐'}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DevChecklist() {
  const [isOpen, setIsOpen] = useState(false);

  if (!import.meta.env.DEV) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg hover:bg-slate-700 transition-colors cursor-pointer"
        title="Mid Review Checklist"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="fixed bottom-16 right-4 z-50 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Mid Review Checklist</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <ChecklistGroup title="Week 1" items={WEEK_1_ITEMS} />
            <ChecklistGroup title="Week 2" items={WEEK_2_ITEMS} />
          </div>

          <p className="mt-3 text-[10px] text-gray-400 text-center">
            Review: 20th — 27th June
          </p>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}

export default DevChecklist;

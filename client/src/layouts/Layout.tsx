import React, { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

type NavItem = {
  icon: string;
  label: string;
  path: string;
};

const NAV_ITEMS: NavItem[] = [
  { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
  { icon: '👥', label: 'Employees', path: '/employees' },
  { icon: '📋', label: 'Leave', path: '/leave' },
  { icon: '💰', label: 'Payroll', path: '/payroll' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string): boolean => location.pathname === path;

  const handleLogout = (): void => {
    navigate('/');
  };

  return (
    <div className="flex h-screen">
      <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col bg-slate-900">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 shrink-0 rounded-md bg-blue-600" />
            <span className="text-lg font-bold text-white">HRMS</span>
          </div>
          <div className="mt-4 border-b border-slate-700" />
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-700 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              HR
            </div>
            <div>
              <p className="text-sm text-white">HR Manager</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-red-500"
          >
            <span aria-hidden="true">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="ml-60 flex-1 overflow-y-auto bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;

import React, { type ReactNode, useMemo, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useLeaves } from '../hooks/useLeave';
import type { EmployeeRole } from '../services/apiService';
import ApiStatus from '../components/ApiStatus';

interface LayoutProps {
  children: ReactNode;
}

type NavItem = {
  icon: string;
  label: string;
  path: string;
};

const ROLE_BADGE: Record<EmployeeRole, { bg: string; text: string; label: string }> = {
  Admin: { bg: 'bg-purple-600/20', text: 'text-purple-300', label: 'Admin' },
  HR: { bg: 'bg-blue-600/20', text: 'text-blue-300', label: 'HR' },
  Manager: { bg: 'bg-orange-600/20', text: 'text-orange-300', label: 'Mgr' },
  Employee: { bg: 'bg-green-600/20', text: 'text-green-300', label: 'Emp' },
};

function getLeaveEmployeeId(leave: { employee: string | { id: string } }): string {
  if (typeof leave.employee === 'object' && leave.employee !== null) {
    return leave.employee.id;
  }
  return leave.employee as string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin, isHR, isManager, isEmployee } = useAuth();

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const { data: leaves, isLoading: leavesLoading } = useLeaves();

  const role = user?.role ?? 'Employee';

  const navItems: NavItem[] = useMemo(() => {
    const base: NavItem[] = [
      { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    ];

    if (isAdmin || isHR || isManager) {
      base.push({ icon: '👥', label: 'Employees', path: '/employees' });
    }

    base.push({ icon: '📋', label: 'Leave', path: '/leave' });

    if (isAdmin || isHR) {
      base.push({ icon: '💰', label: 'Payroll', path: '/payroll' });
    }

    if (isAdmin || isHR || isManager) {
      base.push({ icon: '📊', label: 'Reports', path: '/reports' });
    }

    if (isAdmin) {
      base.push({ icon: '⚙️', label: 'Settings', path: '/settings' });
    }

    return base;
  }, [isAdmin, isHR, isManager, isEmployee]);

  const pendingLeaveCount = useMemo(() => {
    if (!leaves || !user) return 0;
    if (isAdmin || isHR) {
      return leaves.filter((l) => l.status === 'Pending').length;
    }
    return leaves.filter(
      (l) => getLeaveEmployeeId(l) === user.id && l.status === 'Pending',
    ).length;
  }, [leaves, isAdmin, isHR, user]);

  const pageName = useMemo(() => {
    const segment = location.pathname.split('/').filter(Boolean).pop() ?? 'home';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }, [location.pathname]);

  const isActive = (path: string): boolean => location.pathname === path;

  const badge = ROLE_BADGE[role];

  return (
    <div className="flex h-screen">
      {/* Hamburger button — visible on mobile only */}
      <button
        type="button"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md md:hidden"
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop — visible on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/50 transition-opacity duration-300 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-60 flex-col border-r border-slate-700 bg-slate-900 transition-transform duration-300 ease-in-out md:static md:z-auto md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <div className="flex w-full items-center justify-center gap-3 md:justify-start">
            <div className="h-8 w-8 shrink-0 rounded-md bg-blue-600" />
            <span className="hidden text-lg font-bold text-white md:inline">HRMS</span>
            <button
              type="button"
              onClick={closeSidebar}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white md:hidden"
              aria-label="Close sidebar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4 border-b border-slate-700" />
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                onClick={closeSidebar}
                className={`flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors md:justify-start md:px-3 ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
                {item.label === 'Leave' && !leavesLoading && pendingLeaveCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                    {pendingLeaveCount > 9 ? '9+' : pendingLeaveCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-700 p-4">
          {user ? (
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {user.name[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-white">
                    {user.name}
                  </p>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.bg} ${badge.text}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {role === 'Admin' ? 'Administrator' : role}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-500">Online</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4 flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-24 animate-pulse rounded bg-slate-700" />
                <div className="h-3 w-16 animate-pulse rounded bg-slate-700" />
                <div className="h-3 w-14 animate-pulse rounded bg-slate-700" />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-red-500 md:justify-start md:px-3"
          >
            <span aria-hidden="true">🚪</span>
            <span>Logout</span>
          </button>

          <ApiStatus />
          <p className="text-center text-[10px] text-gray-500">v1.0.0</p>
        </div>
      </aside>

      <main className="flex-1 animate-fade-in overflow-y-auto bg-gray-50 p-6">
        <p className="mb-4 text-xs text-gray-400">
          Home <span className="mx-1">&gt;</span> {pageName}
        </p>
        {children}
      </main>
    </div>
  );
};

export default Layout;

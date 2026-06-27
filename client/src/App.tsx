import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DevChecklist from './components/DevChecklist';
import { AuthProvider } from './hooks/useAuth';
import Layout from './layouts/Layout';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import LeavePage from './pages/LeavePage';
import LoginPage from './pages/LoginPage';
import PayrollPage from './pages/PayrollPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <p className="text-8xl font-bold text-gray-300">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 text-sm text-gray-500">
        The page you are looking for does not exist.
      </p>
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Back to Dashboard
      </button>
    </div>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="animate-[fadeIn_200ms_ease-out]"
    >
      {children}
    </div>
  );
}

function GlobalShortcutHandler() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.key === 'Escape') {
        const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
        if (dialog) {
          const closeBtn = dialog.querySelector<HTMLButtonElement>('button[aria-label="Close"]');
          if (closeBtn) {
            e.preventDefault();
            closeBtn.click();
          }
        }
      }

      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey && !isInput) {
        const addBtn = document.querySelector<HTMLButtonElement>('[data-testid="add-employee-btn"]');
        if (addBtn) {
          e.preventDefault();
          addBtn.click();
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return null;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
            <span className="text-xl font-bold tracking-wide text-white">HR</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm font-medium text-gray-400">Loading HRMS...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <GlobalShortcutHandler />
      <PageTransition>
        <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute requiredRole="hr_manager">
              <Layout>
                <EmployeesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave"
          element={
            <ProtectedRoute>
              <Layout>
                <LeavePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payroll"
          element={
            <ProtectedRoute>
              <Layout>
                <PayrollPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredRole="hr_manager">
              <Layout>
                <ReportsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredRole="hr_manager">
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </PageTransition>
      <DevChecklist />
    </AuthProvider>
  );
}

export default App;

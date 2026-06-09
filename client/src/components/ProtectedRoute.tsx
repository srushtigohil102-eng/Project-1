import type { ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

interface Props {
  children: ReactNode;
  requiredRole?: string;
}

function AccessDenied() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <span className="text-3xl text-red-600" aria-hidden="true">
            ✕
          </span>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-3 max-w-md text-base text-gray-600">
          You do not have permission to view this page.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Please contact your HR Manager.
        </p>

        <Link
          to="/dashboard"
          className="mt-8 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, requiredRole }: Props) {
  const { isLoggedIn, isHRManager } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'hr_manager' && !isHRManager) {
    return <AccessDenied />;
  }

  return children;
}

export default ProtectedRoute;

import type { ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import type { UserType } from '../utils/authStorage';

interface Props {
  children: ReactNode;
  requiredRole?: UserType['role'];
}

function AccessDenied() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <span className="text-3xl" aria-hidden="true">
            🛡️
          </span>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">Access Restricted</h1>
        <p className="mt-3 max-w-md text-base text-gray-600">
          You need HR Manager permissions to view this page.
        </p>
        <p className="mt-4 rounded-lg bg-blue-50 px-4 py-2 text-xs text-blue-700">
          Contact your administrator if you believe this is an error.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
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

import type { ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import type { EmployeeRole } from '../services/apiService';

interface Props {
  children: ReactNode;
  allowedRoles?: EmployeeRole[];
}

function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full bg-red-100 p-6">
          <span className="text-4xl" aria-hidden="true">
            🔒
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-gray-800">Access Restricted</h1>
        <p className="mt-2 text-center text-gray-500">
          You do not have the required permissions to view this page.
        </p>
        <p className="mt-1 text-center text-sm text-gray-400">
          Contact your administrator if you believe this is an error.
        </p>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <AccessDenied />;
  }

  return children;
}

export default ProtectedRoute;

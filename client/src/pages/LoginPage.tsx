import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAuth, { type UserType } from '../hooks/useAuth';
import apiFetch from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

interface FormData {
  email: string;
  password: string;
}

interface Errors {
  email?: string;
  password?: string;
  general?: string;
}

interface LoginSuccessResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface LoginErrorResponse {
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOGIN_URL = '/auth/login';

function isUserRole(role: string): role is UserType['role'] {
  return role === 'employee' || role === 'hr_manager';
}

function validateForm(data: FormData): Errors {
  const fieldErrors: Errors = {};

  if (!data.email.trim()) {
    fieldErrors.email = 'Please enter your email';
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    fieldErrors.email = 'Please enter a valid email address';
  }

  if (!data.password) {
    fieldErrors.password = 'Please enter your password';
  } else if (data.password.length < 6) {
    fieldErrors.password = 'Password must be at least 6 characters';
  }

  return fieldErrors;
}

function toUserType(data: LoginSuccessResponse): UserType | null {
  if (!isUserRole(data.user.role)) {
    return null;
  }

  return {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: data.user.role,
  };
}

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const healthQuery = useQuery({
    queryKey: ['api-health'],
    queryFn: () => apiFetch('/health'),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const isApiOffline = healthQuery.isError;

  useEffect(() => {
    document.title = 'Login — HRMS';
  }, []);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange =
    (field: keyof FormData) =>
    (e: ChangeEvent<HTMLInputElement>): void => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const fieldErrors = validateForm(formData);
    if (fieldErrors.email || fieldErrors.password) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    const email = formData.email.trim();
    const { password } = formData;

    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = (await response.json()) as LoginSuccessResponse;
        const user = toUserType(data);

        if (!user) {
          setErrors({ general: 'Something went wrong. Please try again.' });
          return;
        }

        login(data.token, user, rememberMe);
        navigate('/dashboard');
        return;
      }

      if (response.status === 401) {
        const data = (await response.json()) as LoginErrorResponse;
        setErrors({ general: data.message ?? 'Invalid email or password' });
        return;
      }

      if (response.status === 500) {
        setErrors({ general: 'Server error. Please try again later.' });
        return;
      }

      setErrors({ general: 'Something went wrong. Please try again.' });
    } catch {
      setErrors({
        general: 'Cannot connect to server. Please check your connection.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen animate-fade-in items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600">
            <span className="text-lg font-bold tracking-wide text-white">HR</span>
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-gray-900">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to your HRMS account
          </p>
        </div>

        {errors.general && (
          <div className="mb-5 flex items-start gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="mt-0.5 shrink-0 text-base" aria-hidden="true">
              ⚠
            </span>
            <p>{errors.general}</p>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="you@company.com"
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                placeholder="Enter your password"
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 text-sm text-gray-600"
            >
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isLoading && <LoadingSpinner size="sm" className="text-white" />}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {isApiOffline && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
              <p className="text-xs font-medium text-gray-500">
                Demo Mode — API Offline
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                login('demo-token-hr', {
                  id: 'demo-emp-1',
                  name: 'Rahul Sharma',
                  email: 'rahul@company.com',
                  role: 'hr_manager',
                });
                navigate('/dashboard');
              }}
              className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 cursor-pointer"
            >
              Continue as HR Manager (Demo)
            </button>
            <button
              type="button"
              onClick={() => {
                login('demo-token-emp', {
                  id: 'demo-emp-2',
                  name: 'Priya Nair',
                  email: 'priya@company.com',
                  role: 'employee',
                });
                navigate('/dashboard');
              }}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 cursor-pointer"
            >
              Continue as Employee (Demo)
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          HR Management System v1.0
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

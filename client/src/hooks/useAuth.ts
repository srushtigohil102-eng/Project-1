import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearStoredAuth,
  onAuthChange,
  readStoredAuth,
  writeStoredAuth,
  type UserType,
} from '../utils/authStorage';
import { navigateTo, setNavigate } from '../utils/navigation';
import type { EmployeeRole } from '../services/apiService';

export type { UserType };

export type { EmployeeRole };

interface AuthContextValue {
  token: string | null;
  user: UserType | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isHR: boolean;
  isManager: boolean;
  isEmployee: boolean;
  /** True for Admin or HR */
  isHRManager: boolean;
  login: (newToken: string, newUser: UserType, rememberMe?: boolean) => void;
  logout: () => void;
  /** Update stored user data (e.g. after profile edit) without changing token */
  updateUser: (updatedUser: UserType) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const initialAuth = readStoredAuth();
  const [token, setToken] = useState<string | null>(initialAuth.token);
  const [user, setUser] = useState<UserType | null>(initialAuth.user);

  useEffect(() => {
    setNavigate((path) => {
      navigate(path);
    });
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onAuthChange(() => {
      const { token: freshToken, user: freshUser } = readStoredAuth();
      setToken(freshToken);
      setUser(freshUser);
      if (!freshToken) {
        navigateTo('/');
      }
    });
    return unsubscribe;
  }, []);

  const login = useCallback((newToken: string, newUser: UserType, rememberMe = false): void => {
    writeStoredAuth(newToken, newUser, rememberMe);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback((): void => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    navigateTo('/');
  }, []);

  const updateUser = useCallback((updatedUser: UserType): void => {
    writeStoredAuth(token ?? '', updatedUser, !!token);
    setUser(updatedUser);
  }, [token]);

  const role = user?.role;

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isLoggedIn: token !== null,
      isAdmin: role === 'Admin',
      isHR: role === 'HR',
      isManager: role === 'Manager',
      isEmployee: role === 'Employee',
      isHRManager: role === 'Admin' || role === 'HR',
      login,
      logout,
      updateUser,
    }),
    [token, user, login, logout, updateUser],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default useAuth;

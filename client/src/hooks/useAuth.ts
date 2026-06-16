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

export type { UserType };

interface AuthContextValue {
  token: string | null;
  user: UserType | null;
  isLoggedIn: boolean;
  isHRManager: boolean;
  isEmployee: boolean;
  login: (newToken: string, newUser: UserType) => void;
  logout: () => void;
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

  const login = useCallback((newToken: string, newUser: UserType): void => {
    writeStoredAuth(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback((): void => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    navigateTo('/');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isLoggedIn: token !== null,
      isHRManager: user?.role === 'hr_manager',
      isEmployee: user?.role === 'employee',
      login,
      logout,
    }),
    [token, user, login, logout],
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

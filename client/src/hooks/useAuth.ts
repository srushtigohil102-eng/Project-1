import {
  createContext,
  createElement,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface UserType {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'hr_manager';
}

const TOKEN_KEY = 'hrms_token';
const USER_KEY = 'hrms_user';

function readStoredAuth(): { token: string | null; user: UserType | null } {
  const storedToken = sessionStorage.getItem(TOKEN_KEY);
  const storedUser = sessionStorage.getItem(USER_KEY);

  if (!storedToken || !storedUser) {
    return { token: null, user: null };
  }

  try {
    const parsedUser = JSON.parse(storedUser) as UserType;
    return { token: storedToken, user: parsedUser };
  } catch {
    return { token: null, user: null };
  }
}

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
  const [token, setToken] = useState<string | null>(
    () => readStoredAuth().token,
  );
  const [user, setUser] = useState<UserType | null>(() => readStoredAuth().user);

  const login = (newToken: string, newUser: UserType): void => {
    sessionStorage.setItem(TOKEN_KEY, newToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = (): void => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

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
    [token, user],
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

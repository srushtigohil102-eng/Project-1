import { useState, useEffect } from 'react';

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

function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const { token: storedToken, user: storedUser } = readStoredAuth();
    setToken(storedToken);
    setUser(storedUser);
  }, []);

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

  const isLoggedIn = token !== null;
  const isHRManager = user?.role === 'hr_manager';
  const isEmployee = user?.role === 'employee';

  return {
    token,
    user,
    isLoggedIn,
    isHRManager,
    isEmployee,
    login,
    logout,
  };
}

export default useAuth;

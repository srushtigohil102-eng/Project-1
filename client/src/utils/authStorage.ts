export interface UserType {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'hr_manager';
}

export const TOKEN_KEY = 'hrms_token';
export const USER_KEY = 'hrms_user';

function isUserRole(role: unknown): role is UserType['role'] {
  return role === 'employee' || role === 'hr_manager';
}

function isUserType(value: unknown): value is UserType {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const user = value as Record<string, unknown>;

  return (
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    isUserRole(user.role)
  );
}

function getStorage(): Storage {
  return localStorage;
}

export function readStoredAuth(): {
  token: string | null;
  user: UserType | null;
} {
  const storage = getStorage();
  const storedToken = storage.getItem(TOKEN_KEY);
  const storedUser = storage.getItem(USER_KEY);

  if (!storedToken || !storedUser) {
    return { token: null, user: null };
  }

  try {
    const parsedUser: unknown = JSON.parse(storedUser);

    if (!isUserType(parsedUser)) {
      return { token: null, user: null };
    }

    return { token: storedToken, user: parsedUser };
  } catch {
    return { token: null, user: null };
  }
}

export function clearStoredAuth(): void {
  const storage = getStorage();
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
}

export function writeStoredAuth(token: string, user: UserType): void {
  const storage = getStorage();
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function onAuthChange(callback: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === TOKEN_KEY || e.key === USER_KEY) {
      callback();
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

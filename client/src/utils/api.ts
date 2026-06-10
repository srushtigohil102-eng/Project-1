const BASE_URL = 'http://localhost:5000';
const TOKEN_KEY = 'hrms_token';
const USER_KEY = 'hrms_user';

interface ApiErrorBody {
  message?: string;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers);

  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    window.location.href = '/';
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    let message = 'Request failed';

    try {
      const errorBody = (await response.json()) as ApiErrorBody;
      message = errorBody.message ?? message;
    } catch {
      // Response body was not JSON — keep default message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export default apiFetch;

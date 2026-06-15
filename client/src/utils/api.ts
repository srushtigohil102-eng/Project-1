import { clearStoredAuth, TOKEN_KEY } from './authStorage';
import { navigateTo } from './navigation';
import { showError } from './toast';
import { API_BASE_URL } from './config';

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

  const method = options.method ?? 'GET';

  if (import.meta.env.DEV) {
    console.log(`[API] ${method} ${API_BASE_URL}${path}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    if (import.meta.env.DEV) {
      console.error(`[API] Network error for ${method} ${path}`);
    }
    throw new Error('Cannot connect to server. Check your connection.');
  }

  if (import.meta.env.DEV) {
    console.log(`[API] ${response.status} ${method} ${path}`);
  }

  if (response.status === 401) {
    clearStoredAuth();
    showError('Session expired. Please login again.');
    setTimeout(() => navigateTo('/'), 1500);
    throw new Error('Session expired. Please login again.');
  }

  if (response.status === 403) {
    throw new Error('You do not have permission to perform this action');
  }

  if (response.status === 404) {
    throw new Error('The requested resource was not found');
  }

  if (response.status === 500) {
    throw new Error('Server error. Please try again later.');
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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function downloadFile(path: string, filename: string): Promise<void> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const headers = new Headers();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const method = 'GET';

  if (import.meta.env.DEV) {
    console.log(`[API] ${method} ${API_BASE_URL}${path}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
    });
  } catch {
    if (import.meta.env.DEV) {
      console.error(`[API] Network error for ${method} ${path}`);
    }
    throw new Error('Cannot connect to server. Check your connection.');
  }

  if (import.meta.env.DEV) {
    console.log(`[API] ${response.status} ${method} ${path}`);
  }

  if (response.status === 401) {
    clearStoredAuth();
    showError('Session expired. Please login again.');
    setTimeout(() => navigateTo('/'), 1500);
    throw new Error('Session expired. Please login again.');
  }

  if (response.status === 403) {
    throw new Error('You do not have permission to perform this action');
  }

  if (response.status === 404) {
    throw new Error('The requested resource was not found');
  }

  if (response.status === 500) {
    throw new Error('Server error. Please try again later.');
  }

  if (!response.ok) {
    let message = 'Download failed';
    try {
      const errorBody = (await response.json()) as { message?: string };
      message = errorBody.message ?? message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default apiFetch;

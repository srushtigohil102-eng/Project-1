import { clearStoredAuth, readStoredAuth } from './authStorage';
import { navigateTo } from './navigation';
import { showError } from './toast';
import { API_BASE_URL } from './config';

interface ApiErrorBody {
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { token } = readStoredAuth();
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
    let errorBody: ApiErrorBody | undefined;

    try {
      errorBody = (await response.json()) as ApiErrorBody;
      message = errorBody.message ?? message;
    } catch {
      // Response body was not JSON — keep default message.
    }

    const error = new Error(message) as Error & { body?: unknown };
    if (errorBody) {
      error.body = errorBody;
    }
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Extract a filename from the Content-Disposition header, or return null.
 * Handles both `attachment; filename="..."` and `inline; filename=...` forms.
 */
function parseFilenameFromHeader(response: Response): string | null {
  const disposition = response.headers.get('Content-Disposition');
  if (!disposition) return null;

  // Match filename*=UTF-8''<encoded>  (RFC 5987) first, then filename="..." or filename=...
  const rfc5987Match = disposition.match(/filename\*?=(?:UTF-8'')?["]?([^";\n]+)["]?/i);
  if (rfc5987Match) {
    try {
      return decodeURIComponent(rfc5987Match[1].trim());
    } catch {
      return rfc5987Match[1].trim();
    }
  }

  const fallbackMatch = disposition.match(/filename=["']?([^"';,\n]+)["']?/i);
  return fallbackMatch ? fallbackMatch[1].trim() : null;
}

export async function downloadFile(
  path: string,
  fallbackFilename: string,
  signal?: AbortSignal,
): Promise<void> {
  const { token } = readStoredAuth();
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
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    if (import.meta.env.DEV) {
      console.error(`[API] Network error for ${method} ${path}`);
    }
    showError('Cannot connect to server. Check your connection.');
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
    showError('You do not have permission to perform this action');
    throw new Error('You do not have permission to perform this action');
  }

  if (response.status === 404) {
    showError('The requested resource was not found');
    throw new Error('The requested resource was not found');
  }

  if (response.status === 500) {
    showError('Server error. Please try again later.');
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
    showError(message);
    throw new Error(message);
  }

  const contentType = response.headers.get('Content-Type') ?? '';

  if (import.meta.env.DEV) {
    console.debug(`[downloadFile] Status: ${response.status}`);
    console.debug(`[downloadFile] Content-Type: ${contentType}`);
    console.debug(`[downloadFile] Content-Disposition: ${response.headers.get('Content-Disposition')}`);
  }

  // If the server returned JSON instead of a PDF, parse it as an error
  if (contentType.includes('application/json')) {
    let message = 'Download failed';
    try {
      const errorBody = (await response.json()) as { message?: string };
      message = errorBody.message ?? message;
    } catch {
      // ignore
    }
    showError(message);
    throw new Error(message);
  }

  if (!contentType.includes('application/pdf') && !contentType.includes('application/octet-stream')) {
    console.warn(
      `[API] Unexpected Content-Type "${contentType}" for download at ${path}. ` +
      'Expected application/pdf. The downloaded file may be corrupt.',
    );
  }

  const blob = await response.blob();

  if (import.meta.env.DEV) {
    console.debug(`[downloadFile] Blob size: ${blob.size} bytes`);
  }

  if (blob.size === 0) {
    showError('Download failed — server returned an empty file.');
    throw new Error('Download failed — server returned an empty file.');
  }

  // Prefer server-provided filename, fall back to the caller's suggestion
  const filename = parseFilenameFromHeader(response) ?? fallbackFilename;

  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to trigger file download';
    showError(message);
    throw new Error(message);
  }
}

export async function previewFile(
  path: string,
  signal?: AbortSignal,
): Promise<string> {
  const { token } = readStoredAuth();
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
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    if (import.meta.env.DEV) {
      console.error(`[API] Network error for ${method} ${path}`);
    }
    showError('Cannot connect to server. Check your connection.');
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
    showError('You do not have permission to perform this action');
    throw new Error('You do not have permission to perform this action');
  }

  if (response.status === 404) {
    showError('The requested resource was not found');
    throw new Error('The requested resource was not found');
  }

  if (response.status === 500) {
    showError('Server error. Please try again later.');
    throw new Error('Server error. Please try again later.');
  }

  if (!response.ok) {
    let message = 'Preview failed';
    try {
      const errorBody = (await response.json()) as { message?: string };
      message = errorBody.message ?? message;
    } catch {
      // keep default message
    }
    showError(message);
    throw new Error(message);
  }

  const contentType = response.headers.get('Content-Type') ?? '';

  if (contentType.includes('application/json')) {
    let message = 'Preview failed';
    try {
      const errorBody = (await response.json()) as { message?: string };
      message = errorBody.message ?? message;
    } catch {
      // ignore
    }
    showError(message);
    throw new Error(message);
  }

  const blob = await response.blob();

  if (blob.size === 0) {
    showError('Preview failed — server returned an empty file.');
    throw new Error('Preview failed — server returned an empty file.');
  }

  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  return url;
}

export default apiFetch;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export interface ApiError {
  message?: string;
  statusCode?: number;
}

export class ApiClientError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function api<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as ApiError).message)
        : `Request failed (${res.status})`;
    throw new ApiClientError(res.status, message);
  }

  return data as T;
}

export const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('aptrent_token') : null;

export const getStoredUser = (): unknown => {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('aptrent_user') ?? 'null');
  } catch {
    return null;
  }
};

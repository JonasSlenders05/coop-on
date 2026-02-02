export type ApiError = {
  message: string;
  status: number;
  details?: unknown;
};

export type ApiClientOptions = {
  baseUrl: string;
  token?: string;
};

export async function apiRequest<T>(
  { baseUrl, token }: ApiClientOptions,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const hasJson = contentType?.includes('application/json');
  const data = hasJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data
        ? String((data as { message?: string }).message)
        : response.statusText) || 'Request failed';

    const error: ApiError = {
      message,
      status: response.status,
      details: data,
    };

    throw error;
  }

  return data as T;
}

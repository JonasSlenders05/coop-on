import { useCallback, useEffect, useState } from 'react';
import { apiRequest, type ApiClientOptions, type ApiError } from '../api';

export type QueryState<T> = {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refresh: () => Promise<void>;
};

export function useApiQuery<T>(
  client: ApiClientOptions,
  path: string,
  enabled = true,
): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<T>(client, path);
      setData(response);
    } catch (err) {
      setError(err as ApiError);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, path]);

  useEffect(() => {
    if (enabled) {
      void refresh();
    }
  }, [enabled, refresh]);

  return { data, loading, error, refresh };
}

import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url);

export function useAdmins(limit: number = 1000) {
  const { data, error, isLoading, mutate } = useSWR(`/admins?limit=${limit}`, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    admins: Array.isArray(data) ? data : (data?.admins || []),
    isLoading,
    isError: error,
    mutate,
  };
}

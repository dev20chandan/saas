import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url);

export function useUsers(limit: number = 1000) {
  const { data, error, isLoading, mutate } = useSWR(`/users?limit=${limit}`, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    users: data?.data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

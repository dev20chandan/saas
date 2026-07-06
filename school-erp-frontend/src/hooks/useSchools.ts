import useSWR from 'swr';
import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url);

export function useSchools() {
  const { data, error, isLoading, mutate } = useSWR('/schools?limit=1000', fetcher, {
    revalidateOnFocus: false, // Prevent excessive refetches
  });

  return {
    schools: data?.schools || [],
    isLoading,
    isError: error,
    mutate,
  };
}

import useSWR from 'swr';
import { api } from '@/lib/api';

export function useSupport() {
  const { data, error, isLoading, mutate } = useSWR('/support', async (url) => {
    const res = await api.get(url);
    return res;
  });

  return {
    tickets: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

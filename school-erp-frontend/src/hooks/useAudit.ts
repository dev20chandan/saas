import useSWR from 'swr';
import { api } from '@/lib/api';

export function useAudit() {
  const { data, error, isLoading, mutate } = useSWR('/audit', async (url) => {
    const res = await api.get(url);
    return res;
  });

  return {
    audit: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

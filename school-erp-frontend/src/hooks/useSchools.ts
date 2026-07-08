import useSWR from 'swr';
import { api } from '@/lib/api';

// Best Practice: Define interfaces for your data
export interface School {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface SchoolsResponse {
  schools: School[];
  total: number;
}

export function useSchools() {
  // Best Practice: Pass the expected generic type to SWR and use the centralized api.fetcher
  const { data, error, isLoading, mutate } = useSWR<SchoolsResponse>(
    '/schools?limit=1000', 
    api.fetcher, 
    {
      revalidateOnFocus: false, // Prevent excessive refetches
    }
  );

  return {
    schools: data?.schools || [],
    total: data?.total || 0,
    isLoading,
    isError: error,
    mutate,
  };
}

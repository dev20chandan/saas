import useSWR from 'swr';
import { api } from '@/lib/api';

// Best Practice: Define interfaces for your data
export type Plan = 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
export type Status = 'Trial' | 'Active' | 'Expired' | 'Suspended';

export interface School {
  id: string;
  name: string;
  code: string;
  type: string;
  city: string;
  state: string;
  plan: Plan;
  status: Status;
  students: number;
  teachers: number;
  joined: string;
  email: string;
  phone: string;
  operator: string;
  createdAt?: string;
  address?: string;
  isCoaching?: boolean;
}

export interface SchoolsResponse {
  schools: School[];
  total: number;
}

export function useSchools(isCoaching: boolean = false) {
  // Best Practice: Pass the expected generic type to SWR and use the centralized api.fetcher
  const { data, error, isLoading, mutate } = useSWR<SchoolsResponse>(
    `/schools?limit=1000&isCoaching=${isCoaching}`, 
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

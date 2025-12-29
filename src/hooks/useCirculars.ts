import useSWR from 'swr';
import api from '@/lib/axiosConfig';
import { Circular } from '@/types/schoolStoreType';

const fetcher = async (url: string): Promise<Circular[]> => {
  const response = await api.get(url);
  const data = response?.data?.circulars || response?.data || [];
  return Array.isArray(data) ? data : [];
};

export const useCirculars = () => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Circular[]>(
    '/circulars/all',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      fallbackData: []
    }
  );

  return {
    circulars: data ?? [],
    isLoading,
    isValidating,
    error,
    mutate
  };
};

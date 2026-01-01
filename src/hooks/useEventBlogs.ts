import useSWR from 'swr';
import api from '@/lib/axiosConfig';
import axios from 'axios';
import { EventBlog } from '@/types/schoolStoreType';

const fetcher = async (url: string): Promise<EventBlog[]> => {
  const response = await api.get(url);
  const data = response?.data?.blogs || response?.data || [];
  return Array.isArray(data) ? data : [];
};

// For public endpoint - no auth required
const publicFetcher = async (url: string): Promise<EventBlog[]> => {
  let backendUrl = import.meta.env.VITE_BACKEND_API_URL || '';
  // Remove trailing slash if present to avoid double slashes
  if (backendUrl.endsWith('/')) {
    backendUrl = backendUrl.slice(0, -1);
  }
  const response = await axios.get(`${backendUrl}${url}`);
  const data = response?.data?.blogs || response?.data || [];
  return Array.isArray(data) ? data : [];
};

// Hook for authenticated users (teachers/admin) - get all blogs
export const useEventBlogs = () => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<EventBlog[]>(
    '/event-blogs/all',
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
    blogs: data ?? [],
    isLoading,
    isValidating,
    error,
    mutate
  };
};

// Hook for teachers to get their own blogs
export const useMyEventBlogs = () => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<EventBlog[]>(
    '/event-blogs/my-blogs',
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
    blogs: data ?? [],
    isLoading,
    isValidating,
    error,
    mutate
  };
};

// Hook for public gallery - no auth required
export const usePublicEventBlogs = () => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<EventBlog[]>(
    '/event-blogs/public',
    publicFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
      errorRetryCount: 3,
      fallbackData: []
    }
  );

  return {
    blogs: data ?? [],
    isLoading,
    isValidating,
    error,
    mutate
  };
};

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAuth } from 'firebase/auth';
import { BACKEND_URL } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000, // 30 second timeout for slow connections
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    if (import.meta.env.DEV) {
      console.log('userToken', token); // log only in dev
    }
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Don't show toast for cancelled requests
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      toast({
        title: 'Connection Error',
        description: 'Network error. Please check your connection and try again.',
        variant: 'destructive'
      });
    } else if (error.response?.status === 401) {
      toast({
        title: 'Session Expired',
        description: 'Your session has expired. Please log in again.',
        variant: 'destructive'
      });
    } else if (error.response?.status === 429) {
      toast({
        title: 'Too Many Requests',
        description: 'Please wait a moment before trying again.',
        variant: 'destructive'
      });
    } else if (error.response?.status >= 500) {
      toast({
        title: 'Server Error',
        description: 'Server error. Please try again later.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive'
      });
    }
    return Promise.reject(error);
  }
);

export default api;

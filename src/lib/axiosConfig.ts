import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { BACKEND_URL } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const api = axios.create({
  baseURL: BACKEND_URL
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
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      toast({
        title: 'Error',
        description: 'Network error. Please check your connection.',
        variant: 'destructive'
      });
    } else if (error.response?.status === 401) {
      toast({
        title: 'Error',
        description: 'Session expired. Please log in again.',
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

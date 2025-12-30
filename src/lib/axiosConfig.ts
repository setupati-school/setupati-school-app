import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { BACKEND_URL } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { getOfflineAPIInterceptor } from './offline-api-interceptor';
import {
  getCurrentIdToken,
  isInitialAuthLoad,
  handleSessionExpiry,
  shouldTriggerLogout
} from './auth-utils';

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000, // 30 second timeout for slow connections
  headers: {
    'Content-Type': 'application/json'
  }
});

// Initialize offline API interceptor
const offlineInterceptor = getOfflineAPIInterceptor();

api.interceptors.request.use(async (config) => {
  if (import.meta.env.DEV) {
    console.log(
      '🔐 Axios interceptor: Getting auth token for request to:',
      config.url
    );
  }

  // Try to get the current ID token (waits for auth to be ready)
  let token = await getCurrentIdToken();

  // If that fails, try the direct method as fallback
  if (!token) {
    if (import.meta.env.DEV) {
      console.log(
        '🔄 Axios interceptor: Trying direct token method as fallback'
      );
    }
    const { getCurrentIdTokenDirect } = await import('./auth-utils');
    token = await getCurrentIdTokenDirect();
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    if (import.meta.env.DEV) {
      console.log('✅ Axios interceptor: Added auth token to request');
    }
  } else {
    if (import.meta.env.DEV) {
      console.log(
        '❌ Axios interceptor: No auth token available (tried both methods)'
      );
    }
  }

  return config;
});

api.interceptors.response.use(
  async (response) => {
    // Cache successful GET responses to IndexedDB for offline access
    await offlineInterceptor.handleResponse(response);
    return response;
  },
  async (error: AxiosError) => {
    // Don't show toast for cancelled requests
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      toast({
        title: 'Connection Error',
        description:
          'Network error. Please check your connection and try again.',
        variant: 'destructive'
      });
    } else if (error.response?.status === 401) {
      // Check if this is an initial page load or actual session expiry
      const isInitialLoad = isInitialAuthLoad();

      if (isInitialLoad) {
        // Don't show toast for initial loads - let the auth flow handle it
        console.log('401 during initial auth load - ignoring');
      } else {
        // Check if we should trigger logout (user was authenticated but session expired)
        const shouldLogout = await shouldTriggerLogout();

        if (shouldLogout) {
          toast({
            title: 'Session Expired',
            description: 'Your session has expired. Redirecting to login...',
            variant: 'destructive'
          });

          // Automatically logout and redirect
          setTimeout(() => {
            handleSessionExpiry();
          }, 1500); // Give user time to see the message
        } else {
          // User wasn't authenticated anyway, just show a generic message
          toast({
            title: 'Authentication Required',
            description: 'Please log in to access this resource.',
            variant: 'destructive'
          });
        }
      }
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

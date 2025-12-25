import { useEffect, useRef } from 'react';
import { CancelTokenSource } from 'axios';
import axios from 'axios';

/**
 * Custom hook to cancel axios requests when component unmounts
 * Prevents memory leaks and unnecessary network requests
 * 
 * @returns Object with getCancelToken function and cancel method
 */
export function useRequestCancellation() {
  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);

  const getCancelToken = () => {
    // Cancel previous request if exists
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel('Component unmounted or new request initiated');
    }

    // Create new cancel token
    cancelTokenSourceRef.current = axios.CancelToken.source();
    return cancelTokenSourceRef.current.token;
  };

  const cancel = () => {
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel('Request cancelled');
      cancelTokenSourceRef.current = null;
    }
  };

  useEffect(() => {
    // Cancel any pending requests on unmount
    return () => {
      cancel();
    };
  }, []);

  return { getCancelToken, cancel };
}




// Debug utilities for Firebase authentication
// Provides global debug functions for troubleshooting auth issues

import { getAuth } from 'firebase/auth';
import {
  waitForAuthReady,
  getCurrentIdToken,
  isAuthenticated,
  isInitialAuthLoad,
  checkFirebaseAuthState,
  refreshAuthState,
  getCurrentUserDirect,
  getCurrentIdTokenDirect
} from './auth-utils';

/**
 * Debug class for Firebase authentication
 */
export class AuthDebugger {
  /**
   * Log comprehensive debug information
   */
  static async logDebugInfo(): Promise<void> {
    console.log('🔍 Firebase Auth Debug Information:');
    console.log('=====================================');

    const auth = getAuth();
    const isInitialLoad = isInitialAuthLoad();

    try {
      const user = await waitForAuthReady();
      const token = await getCurrentIdToken();
      const authenticated = await isAuthenticated();

      console.log('📊 Auth State:');
      console.log(
        '  - Firebase currentUser:',
        auth.currentUser?.email || 'null'
      );
      console.log('  - waitForAuthReady result:', user?.email || 'null');
      console.log('  - isAuthenticated:', authenticated);
      console.log('  - isInitialLoad:', isInitialLoad);
      console.log('  - Token exists:', !!token);
      console.log(
        '  - Token preview:',
        token ? `${token.substring(0, 20)}...` : 'null'
      );

      console.log('🔧 Internal State:');
      checkFirebaseAuthState();
    } catch (error) {
      console.error('❌ Error during debug:', error);
    }
  }

  /**
   * Get comprehensive auth state information
   */
  static async getAuthState(): Promise<{
    isInitialLoad: boolean;
    isAuthenticated: boolean;
    hasCurrentUser: boolean;
    tokenExists: boolean;
    authReady: boolean;
    userEmail?: string;
    tokenPreview?: string;
    firebaseCurrentUser?: string;
    authInitialized?: boolean;
  }> {
    const auth = getAuth();
    const isInitialLoad = isInitialAuthLoad();

    try {
      const user = await waitForAuthReady();
      const token = await getCurrentIdToken();
      const authenticated = await isAuthenticated();

      return {
        isInitialLoad,
        isAuthenticated: authenticated,
        hasCurrentUser: !!user,
        tokenExists: !!token,
        authReady: true,
        userEmail: user?.email,
        tokenPreview: token ? `${token.substring(0, 20)}...` : undefined,
        firebaseCurrentUser: auth.currentUser?.email || 'null',
        authInitialized: true
      };
    } catch (error) {
      return {
        isInitialLoad,
        isAuthenticated: false,
        hasCurrentUser: !!auth.currentUser,
        tokenExists: false,
        authReady: false,
        firebaseCurrentUser: auth.currentUser?.email || 'null',
        authInitialized: false
      };
    }
  }

  /**
   * Simulate a 401 error to test error handling
   */
  static async simulate401Error(): Promise<{
    shouldLogout: boolean;
    isInitialLoad: boolean;
  }> {
    const { shouldTriggerLogout } = await import('./auth-utils');
    const isInitialLoad = isInitialAuthLoad();
    const shouldLogout = await shouldTriggerLogout();

    return {
      shouldLogout,
      isInitialLoad
    };
  }
}

// Add global debug functions for easy console testing
if (typeof window !== 'undefined') {
  (window as any).debugAuth = async () => {
    await AuthDebugger.logDebugInfo();
  };

  (window as any).getAuthState = async () => {
    const state = await AuthDebugger.getAuthState();
    console.log('🔐 Current Auth State:', state);
    return state;
  };

  (window as any).test401 = async () => {
    const result = await AuthDebugger.simulate401Error();
    console.log('🚨 401 Error Test:', result);
    return result;
  };

  (window as any).checkFirebaseAuth = () => {
    checkFirebaseAuthState();
  };

  (window as any).forceRefreshAuth = () => {
    refreshAuthState();
    console.log('🔄 Auth state refreshed');
  };

  (window as any).getCurrentUserDirect = () => {
    const user = getCurrentUserDirect();
    console.log('👤 Direct Firebase user:', user?.email || 'null');
    return user;
  };

  (window as any).testDirectToken = async () => {
    const token = await getCurrentIdTokenDirect();
    console.log('🎫 Direct token result:', token ? 'SUCCESS' : 'FAILED');
    return token;
  };

  console.log('🛠️ Auth debug functions available:');
  console.log('  - debugAuth() - Full debug info');
  console.log('  - getAuthState() - Current auth state');
  console.log('  - test401() - Test 401 error handling');
  console.log('  - checkFirebaseAuth() - Check Firebase auth state');
  console.log('  - forceRefreshAuth() - Force refresh auth state');
  console.log('  - getCurrentUserDirect() - Get Firebase user directly');
  console.log('  - testDirectToken() - Test direct token retrieval');
}

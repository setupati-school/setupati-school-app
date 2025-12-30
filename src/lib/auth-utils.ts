// Authentication utilities for Firebase
// Provides helpers to ensure Firebase auth is ready before making API calls

import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';

// Global promise to track when Firebase auth is ready
let authReadyPromise: Promise<User | null> | null = null;
let isAuthInitialized = false;
let currentAuthUser: User | null = null;

/**
 * Wait for Firebase authentication to be ready
 * This ensures that the initial auth state has been determined
 * @returns Promise that resolves with the current user (or null if not authenticated)
 */
export const waitForAuthReady = (): Promise<User | null> => {
  const auth = getAuth();

  console.log('waitForAuthReady: Starting auth check');
  console.log('waitForAuthReady: isAuthInitialized =', isAuthInitialized);
  console.log(
    'waitForAuthReady: currentAuthUser =',
    currentAuthUser?.email || 'null'
  );
  console.log(
    'waitForAuthReady: auth.currentUser =',
    auth.currentUser?.email || 'null'
  );

  // ALWAYS check Firebase auth.currentUser first - it's the source of truth
  if (auth.currentUser) {
    console.log(
      'waitForAuthReady: Firebase has currentUser, updating our state'
    );
    isAuthInitialized = true;
    currentAuthUser = auth.currentUser;
    return Promise.resolve(auth.currentUser);
  }

  // If we already have a cached user but Firebase doesn't, clear our cache
  if (currentAuthUser && !auth.currentUser) {
    console.log('waitForAuthReady: Clearing stale cached user');
    currentAuthUser = null;
  }

  // If auth is initialized but no user, return null
  if (isAuthInitialized && !auth.currentUser) {
    console.log('waitForAuthReady: Auth initialized but no user');
    return Promise.resolve(null);
  }

  // If we already have a promise, return it
  if (authReadyPromise) {
    console.log('waitForAuthReady: Returning existing promise');
    return authReadyPromise;
  }

  console.log('waitForAuthReady: Creating new auth promise');
  authReadyPromise = new Promise((resolve) => {
    // Double-check Firebase currentUser
    if (auth.currentUser) {
      console.log(
        'waitForAuthReady: Firebase currentUser found in promise:',
        auth.currentUser.email
      );
      isAuthInitialized = true;
      currentAuthUser = auth.currentUser;
      resolve(auth.currentUser);
      return;
    }

    console.log('waitForAuthReady: Waiting for auth state change');
    // Wait for auth state change
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(
        'waitForAuthReady: Auth state changed to:',
        user?.email || 'null'
      );
      isAuthInitialized = true;
      currentAuthUser = user;
      unsubscribe();
      resolve(user);
    });
  });

  return authReadyPromise;
};

/**
 * Get the current Firebase ID token if user is authenticated
 * Waits for auth to be ready first
 * @returns Promise that resolves with the ID token or null if not authenticated
 */
export const getCurrentIdToken = async (): Promise<string | null> => {
  try {
    const user = await waitForAuthReady();

    if (!user) {
      console.log('getCurrentIdToken: No authenticated user found');
      return null;
    }

    const token = await user.getIdToken();
    console.log('getCurrentIdToken: Successfully retrieved token');
    return token;
  } catch (error) {
    console.error('getCurrentIdToken: Failed to get Firebase ID token:', error);
    return null;
  }
};

/**
 * Check if the user is currently authenticated
 * Waits for auth to be ready first
 * @returns Promise that resolves with true if authenticated, false otherwise
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await waitForAuthReady();
  return !!user;
};

/**
 * Get the current user
 * Waits for auth to be ready first
 * @returns Promise that resolves with the current user or null
 */
export const getCurrentUser = async (): Promise<User | null> => {
  return await waitForAuthReady();
};

/**
 * Force refresh the auth state (useful after login/logout)
 */
export const refreshAuthState = (): void => {
  authReadyPromise = null;
  isAuthInitialized = false;
  currentAuthUser = null;
};

/**
 * Reset the auth ready promise (useful for testing or auth state changes)
 */
export const resetAuthReady = (): void => {
  refreshAuthState();
};

/**
 * Check if this is likely an initial page load where auth hasn't been determined yet
 * @returns boolean indicating if this appears to be an initial load
 */
export const isInitialAuthLoad = (): boolean => {
  return !isAuthInitialized;
};

/**
 * Handle session expiry by logging out the user
 * This should be called when a 401 error indicates the session is truly expired
 */
export const handleSessionExpiry = async (): Promise<void> => {
  try {
    const auth = getAuth();
    await signOut(auth);

    // Reset auth state
    refreshAuthState();

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  } catch (error) {
    console.error('Error during session expiry logout:', error);
    // Force redirect even if logout fails
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }
};

/**
 * Check if a 401 error should trigger automatic logout
 * @param isUserCurrentlyAuthenticated - Whether the user appears to be authenticated
 * @returns boolean indicating if logout should be triggered
 */
export const shouldTriggerLogout = async (): Promise<boolean> => {
  // Wait for auth to be ready first
  await waitForAuthReady();

  // If auth is initialized and user appears authenticated, 401 means session expired
  return isAuthInitialized && (await isAuthenticated());
};

/**
 * Debug function to check current Firebase auth state
 */
export const checkFirebaseAuthState = (): void => {
  const auth = getAuth();
  console.log('🔍 Firebase Auth Debug:');
  console.log('  - currentUser:', auth.currentUser?.email || 'null');
  console.log('  - isAuthInitialized:', isAuthInitialized);
  console.log('  - currentAuthUser:', currentAuthUser?.email || 'null');
  console.log('  - authReadyPromise exists:', !!authReadyPromise);
};

/**
 * Get current user directly from Firebase (no waiting)
 */
export const getCurrentUserDirect = (): User | null => {
  const auth = getAuth();
  return auth.currentUser;
};

/**
 * Get current ID token directly (no waiting) - for emergency use
 */
export const getCurrentIdTokenDirect = async (): Promise<string | null> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.log('getCurrentIdTokenDirect: No user found');
    return null;
  }

  try {
    const token = await user.getIdToken();
    console.log('getCurrentIdTokenDirect: Got token successfully');
    return token;
  } catch (error) {
    console.error('getCurrentIdTokenDirect: Error getting token:', error);
    return null;
  }
};

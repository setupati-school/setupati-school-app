import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthState, UserRole } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        role: null,
        loading: true,
        isAuthenticated: false,

        setUser: (user) =>
          set({
            user,
            isAuthenticated: !!user
          }),

        setRole: (role) => set({ role }),
        setLoading: (loading) => set({ loading }),

        hasRole: (roles) => roles.includes(get().role ?? ''),

        resetAuthStore: () =>
          set({
            user: null,
            role: null,
            loading: true,
            isAuthenticated: false
          }),

        initAuthListener: () => {
          try {
            onAuthStateChanged(auth, async (firebaseUser) => {
              if (firebaseUser) {
                const tokenResult = await getIdTokenResult(firebaseUser);
                const claims = tokenResult.claims;

                set({
                  user: firebaseUser,
                  role: claims.role as UserRole,
                  isAuthenticated: true,
                  loading: false
                });
              } else {
                set({
                  user: null,
                  role: null,
                  isAuthenticated: false,
                  loading: false
                });
              }
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Unable to Authenticate User';
            toast({
              title: 'Error',
              description: errorMessage,
              variant: 'destructive'
            });
          }
        }
      }),
      {
        name: 'auth-store'
      }
    )
  )
);

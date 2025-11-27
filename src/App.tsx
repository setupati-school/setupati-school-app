import './index.css';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from '@/components/Authentication/ProtectedRoute';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { SonnerToaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthLayout } from '@/components/Authentication/AuthLayout';
import { Forbidden } from '@/pages/Forbidden';
import { LandingPage } from '@/pages/LandingPage';
import { Gallery } from '@/pages/Gallery';
import { useAuthStore } from '@/store/authStore';
import { useSchoolStore } from '@/store/schoolStore';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

const queryClient = new QueryClient();

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/gallery',
    element: <Gallery />
  },
  {
    path: 'auth/login',
    element: <AuthLayout />
  },
  {
    path: 'auth/forgot-password',
    element: <AuthLayout />
  },
  {
    path: 'auth/reset-password',
    element: <AuthLayout />
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Index />
      </ProtectedRoute>
    )
  },
  {
    path: '/403',
    element: <Forbidden />
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

const App = () => {
  const { initAuthListener } = useAuthStore();
  const { initCurrentUser } = useSchoolStore();

  useEffect(() => {
    const initializeApp = async () => {
      await initAuthListener();
      await initCurrentUser();
    };

    initializeApp();
  }, [initAuthListener, initCurrentUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <Toaster />
          <SonnerToaster />
          <RouterProvider router={router} />
        </TooltipProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

export default App;

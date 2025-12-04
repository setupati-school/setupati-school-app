import './index.css';
import React, { useEffect, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Gallery, Forbidden, LandingPage, NotFound } from '@/pages';
import { DashboardRoute } from '@/components/Dashboard';
import { CircularsPage } from '@/components/Circulars';
import { SubjectsPage } from '@/components/Subject';
import { TimetablePage } from '@/components/Timetable';
import { Toaster } from '@/components/ui/toaster';
import { SonnerToaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import {
  AuthLayout,
  ProtectedRoute,
  RoleRoute
} from '@/components/Authentication';
import { useAuthStore, useSchoolStore } from '@/store';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// ---------- Lazy-loaded layout & dashboards ----------
const Main = React.lazy(() =>
  import('@/pages').then((m) => ({
    default: m.Main
  }))
);

// SignUpForm has default export, so we can lazy it directly
const SignUpForm = React.lazy(() =>
  import('@/components/admin').then((m) => ({ default: m.SignUpForm }))
);

const StudentResultLookup = React.lazy(() =>
  import('@/components/Students/StudentResultLookup')
);

const ExamResultsPage = React.lazy(() =>
  import('@/components/ExamResults/ExamResultsPage')
);

const ResultsRoute: React.FC = () => {
  const { role } = useAuthStore();

  if (role === 'admin') {
    return <ExamResultsPage />;
  }
  return <StudentResultLookup />;
};

const ComingSoon: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle
}) => (
  <div className="text-center py-12">
    <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
    <p className="text-muted-foreground">{subtitle}</p>
  </div>
);

const queryClient = new QueryClient();

export const router = createBrowserRouter([
  // Public pages
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/gallery',
    element: <Gallery />
  },
  // Auth pages (login / forgot / reset)
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
    element: (
      <ProtectedRoute>
        <Main />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardRoute />
      },

      {
        path: '/students',
        element: (
          <ComingSoon
            title="Student Section"
            subtitle="Student module coming soon..."
          />
        )
      },
      {
        path: '/teachers',
        element: (
          <ComingSoon
            title="Teacher Section"
            subtitle="Teacher module coming soon..."
          />
        )
      },
      {
        path: '/create',
        element: (
          <RoleRoute allowedRoles={['admin']}>
            <SignUpForm />
          </RoleRoute>
        )
      },
      {
        path: '/timetable',
        element: <TimetablePage />
      },
      {
        path: '/attendance',
        element: (
          <ComingSoon
            title="Attendance Tracking"
            subtitle="Attendance module coming soon..."
          />
        )
      },
      {
        path: '/subjects',
        element: <SubjectsPage />
      },
      {
        path: '/circulars',
        element: <CircularsPage />
      },
      {
        path: '/results',
        element: <ResultsRoute />
      }
    ]
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

const App: React.FC = () => {
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
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
              </div>
            }
          >
            <RouterProvider router={router} />
          </Suspense>
        </TooltipProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

export default App;

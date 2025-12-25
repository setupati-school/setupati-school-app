import './index.css';
import React, { useEffect, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Gallery, Forbidden, LandingPage, NotFound } from '@/pages';
import { DashboardRoute } from '@/components/Dashboard';

// Lazy load heavy pages for better initial load
const CircularsPage = React.lazy(() =>
  import('@/components/Circulars').then((m) => ({ default: m.CircularsPage }))
);
const SubjectsPage = React.lazy(() =>
  import('@/components/Subject').then((m) => ({ default: m.SubjectsPage }))
);
const TimetablePage = React.lazy(() =>
  import('@/components/Timetable').then((m) => ({ default: m.TimetablePage }))
);
const AttendancePage = React.lazy(() =>
  import('@/components/Attendance').then((m) => ({ default: m.AttendancePage }))
);
const TeachersPage = React.lazy(() =>
  import('@/components/Teachers/TeachersPage').then((m) => ({ default: m.TeachersPage }))
);
const StudentsPage = React.lazy(() =>
  import('@/components/Students/StudentsPage').then((m) => ({ default: m.StudentsPage }))
);
import { Toaster } from '@/components/ui/toaster';
import { SonnerToaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../i18n';
import {
  AuthLayout,
  ProtectedRoute,
  RoleRoute
} from '@/components/Authentication';
import { useAuthStore, useSchoolStore } from '@/store';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Helmet } from "react-helmet";
import { ErrorBoundary } from '@/components/ErrorBoundary';


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

const StudentProfilePage = React.lazy(() =>
  import('@/components/Students/StudentProfilePage')
);

const ResultsRoute: React.FC = () => {
  const { role } = useAuthStore();

  if (role === 'admin' || role === 'teacher') {
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

// Configure QueryClient for mobile optimization
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes before considering it stale
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Disable refetch on window focus for mobile (saves battery and data)
      refetchOnWindowFocus: false,
      // Disable refetch on reconnect for mobile (prevents unnecessary calls)
      refetchOnReconnect: false,
      // Retry logic with exponential backoff for network failures
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for network errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Network mode: prefer online but allow offline cache
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations once on network failure
      retry: 1,
      retryDelay: 1000,
    },
  },
});

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
          <RoleRoute allowedRoles={['admin', 'teacher']}>
            <Suspense fallback={<LoadingSpinner />}>
              <StudentsPage />
            </Suspense>
          </RoleRoute>
        )
      },
      {
        path: '/teachers',
        element: (
          <RoleRoute allowedRoles={['admin', 'teacher']}>
            <Suspense fallback={<LoadingSpinner />}>
              <TeachersPage />
            </Suspense>
          </RoleRoute>
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
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TimetablePage />
          </Suspense>
        )
      },
      {
        path: '/attendance',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AttendancePage />
          </Suspense>
        )
      },
      {
        path: '/subjects',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <SubjectsPage />
          </Suspense>
        )
      },
      {
        path: '/circulars',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CircularsPage />
          </Suspense>
        )
      },
      {
        path: '/results',
        element: <ResultsRoute />
      },
      {
        path: '/profile',
        element: <StudentProfilePage />
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
  const { t } = useTranslation();

  useEffect(() => {
    const initializeApp = async () => {
      await initAuthListener();
      await initCurrentUser();
    };

    initializeApp();
  }, [initAuthListener, initCurrentUser]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <Helmet>
            <title>t{t('title')}</title>
          </Helmet>
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
    </ErrorBoundary>
  );
};

export default App;

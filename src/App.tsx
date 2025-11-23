import '@/index.css';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from '@/components/Authentication/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { SonnerToaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthLayout } from '@/components/Authentication/AuthLayout';
import { useAuthStore } from '@/store/authStore';
import { useSchoolStore } from '@/store/schoolStore';
import LandingPage from '@/pages';
import Gallery from '@/pages/gallery';
import NotFound from '@/pages/not-found';
import Forbidden from '@/pages/forbidden';
import  StudentsPage  from '@/pages/students';
import TeachersPage from '@/pages/teachers';
import AdminDashboard from '@/pages/admin/dashboard';
import SubjectsPage from '@/pages/subjects';
import AttendancePage from '@/pages/attendance';
import TimetablePage from '@/pages/timetable';
import CircularPage from '@/pages/circular';
import SettingsPage from '@/pages/settings';

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
    path: '/students',
    element: (
      <ProtectedRoute>
        <StudentsPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/teachers',
    element: (
      <ProtectedRoute>
        <TeachersPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    )
  },
    {
    path: '/subjects',
    element: (
      <ProtectedRoute>
        <SubjectsPage />
      </ProtectedRoute>
    )
  },
    {
    path: '/attendance',
    element: (
      <ProtectedRoute>
        <AttendancePage />
      </ProtectedRoute>
    )
  },
    {
    path: '/timetable',
    element: (
      <ProtectedRoute>
        <TimetablePage />
      </ProtectedRoute>
    )
  },
    {
    path: '/circulars',
    element: (
      <ProtectedRoute>
        <CircularPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <SettingsPage />
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
      <TooltipProvider>
        <Toaster />
        <SonnerToaster />
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

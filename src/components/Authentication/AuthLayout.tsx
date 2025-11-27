// src/components/auth/AuthLayout.tsx
import React, { Suspense, useMemo, useCallback } from 'react';
import { useMatch, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import i18n from '../../../i18n';
import { useSchoolStore } from '../../store/schoolStore';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const LoginForm = React.lazy(() =>
  import('./LoginForm').then((m) => ({ default: m.LoginForm }))
);
const ForgotPasswordForm = React.lazy(() =>
  import('./ForgotPasswordForm').then((m) => ({
    default: m.ForgotPasswordForm
  }))
);
const ResetPassword = React.lazy(() =>
  import('./ResetPassword').then((m) => ({ default: m.ResetPassword }))
);

export type AuthView = 'login' | 'forgot' | 'reset';

export const AuthLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  i18n.language = useSchoolStore((state) => state.currentLanguage);

  const isForgot = useMatch('/auth/forgot-password');
  const isReset = useMatch('/auth/reset-password');

  const currentView: AuthView = useMemo(() => {
    if (isReset) return 'reset';
    if (isForgot) return 'forgot';
    return 'login';
  }, [isForgot, isReset]);

  const toggleView = useCallback(
    (view: AuthView) => {
      switch (view) {
        case 'login':
          navigate('/auth/login', { replace: true });
          break;
        case 'forgot':
          navigate('/auth/forgot-password', { replace: true });
          break;
        case 'reset':
          navigate('/auth/reset-password', { replace: true });
          break;
      }
    },
    [navigate]
  );

  if (isAuthenticated) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t('title')} School Login
          </h1>
          <p className="text-muted-foreground">
            Empowering Education Through Technology
          </p>
        </div>

        <div className="transition-all duration-300 ease-in-out">
          <Suspense fallback={<LoadingSpinner />}>
            {currentView === 'forgot' ? (
              <ForgotPasswordForm toggleCurrentView={toggleView} />
            ) : currentView === 'reset' ? (
              <ResetPassword toggleCurrentView={toggleView} />
            ) : (
              <LoginForm toggleCurrentView={toggleView} />
            )}
          </Suspense>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            © 2025 School ERP System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

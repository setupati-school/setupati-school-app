import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetPassword } from './ResetPassword';
import { useAuthStore } from '@/store/authStore';

export interface FormDataType {
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

export const AuthLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<'login' | 'forgot' | 'reset'>(
    'login'
  );
  const [formData, setFormData] = useState<FormDataType>({
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (location.pathname.includes('reset-password')) {
      setCurrentView('reset');
    } else if (location.pathname.includes('forgot-password')) {
      setCurrentView('forgot');
    } else {
      setCurrentView('login');
    }
  }, [location.pathname]);

  const toggleCurrentView = (view: 'login' | 'forgot' | 'reset') => {
    setCurrentView(view);

    if (view === 'login') navigate('/auth/login');
    else if (view === 'forgot') navigate('/auth/forgot-password');
    else if (view === 'reset') navigate('/auth/reset-password');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBooleanInputChange = (field: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const displayFormData = (data: Partial<FormDataType>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Setupati School Login
          </h1>
          <p className="text-muted-foreground">
            Empowering Education Through Technology
          </p>
        </div>

        {/* Transition between different views */}
        <div className="transition-all duration-300 ease-in-out">
          {currentView === 'login' ? (
            <LoginForm
              toggleCurrentView={toggleCurrentView}
              formData={formData}
              handleInputChange={handleInputChange}
              handleBooleanInputChange={handleBooleanInputChange}
            />
          ) : currentView === 'forgot' ? (
            <ForgotPasswordForm
              toggleCurrentView={toggleCurrentView}
              formData={formData}
              handleInputChange={handleInputChange}
            />
          ) : (
            <ResetPassword
              toggleCurrentView={toggleCurrentView}
              formData={formData}
              displayFormData={displayFormData}
              handleInputChange={handleInputChange}
              handleBooleanInputChange={handleBooleanInputChange}
            />
          )}
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

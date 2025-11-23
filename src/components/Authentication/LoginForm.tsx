import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import {
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { useSchoolStore } from '@/store/schoolStore';
import api from '@/lib/axiosConfig';
import { User as UserData } from '@/types/schoolStore';
import { FormDataType } from './AuthLayout';

interface LoginFormProps {
  toggleCurrentView: (view: 'login' | 'forgot' | 'reset') => void;
  formData: FormDataType;
  handleInputChange: (field: string, value: string) => void;
  handleBooleanInputChange: (field: string, value: boolean) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  toggleCurrentView,
  formData,
  handleInputChange,
  handleBooleanInputChange
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { setCurrentUser } = useSchoolStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const userRecord = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const user = userRecord.user;

      if (!user) {
        throw new Error('User not found.');
      }

      const response = await api.get(`/api/v1/auth/users/${user.uid}`);

      const userData: UserData = response.data.user;

      if (!userData) {
        throw new Error('User not found.');
      }

      setCurrentUser(userData);

      toast({
        title: 'Success',
        description: 'Successfully logged in!',
        variant: 'default'
      });

      navigate('/admin/dashboard');
    } catch (error: unknown) {
      let errorMessage = '';
      if ((error as { code: string }).code === 'auth/invalid-credential') {
        errorMessage = 'Incorrect password or email address.';
      } else {
        errorMessage =
          error instanceof Error
            ? error.response?.data?.error || error?.message
            : 'Failed to login. Please try again.';
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-medium border-0">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
          <GraduationCap className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Sign in to your account
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10 border-border focus:ring-accent"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="password"
                type={formData.showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10 border-border focus:ring-accent"
                required
              />
              <button
                type="button"
                onClick={() =>
                  handleBooleanInputChange(
                    'showPassword',
                    !formData?.showPassword
                  )
                }
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {formData.showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-accent border-border rounded focus:ring-accent"
              />
              <Label
                htmlFor="remember"
                className="text-sm text-muted-foreground"
              >
                Remember me
              </Label>
            </div>
            <button
              type="button"
              onClick={() => toggleCurrentView('forgot')}
              className="text-sm text-accent hover:text-accent/80 font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="login"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

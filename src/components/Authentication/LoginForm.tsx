import React, { useState, memo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import {
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword
} from 'firebase/auth';

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
import { useSchoolStore } from '@/store/schoolStore';
import api from '@/lib/axiosConfig';
import { User as UserData } from '@/types';
import { loginSchema } from '@/components/zod';

interface LoginFormProps {
  toggleCurrentView: (view: 'login' | 'forgot' | 'reset') => void;
}

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginFormComponent: React.FC<LoginFormProps> = ({
  toggleCurrentView
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { setCurrentUser } = useSchoolStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    mode: 'onSubmit'
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await setPersistence(
        auth,
        values.rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const userRecord = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
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

      navigate('/dashboard');
    } catch (error: unknown) {
      let errorMessage = 'Failed to login. Please try again.';

      const err = error as any;

      if (err?.code === 'auth/invalid-credential') {
        errorMessage = 'Incorrect password or email address.';
      } else if ((error as AxiosError)?.response?.data) {
        const data: any = (error as AxiosError).response?.data;
        if (data?.error) errorMessage = data.error;
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      setError('password', {
        type: 'server',
        message: errorMessage
      });

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                className="pl-10 border-border focus:ring-accent"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
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
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="pl-10 pr-10 border-border focus:ring-accent"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 text-accent border-border rounded focus:ring-accent"
                {...register('rememberMe')}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export const LoginForm = memo(LoginFormComponent);

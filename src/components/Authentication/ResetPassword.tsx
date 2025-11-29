// src/components/auth/ResetPassword.tsx
import React, { memo, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { Mail, EyeOff, Eye, CheckCircle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { firebaseErrorParser } from '@/lib/firebaseErrorParser';
import { resetPasswordSchema } from '@/components/zod';

interface ResetPasswordProps {
  toggleCurrentView: (view: 'login' | 'forgot' | 'reset') => void;
}

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordComponent: React.FC<ResetPasswordProps> = ({
  toggleCurrentView
}) => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const oobCode = searchParams.get('oobCode');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    },
    mode: 'onSubmit'
  });

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        toast({
          variant: 'destructive',
          title: 'Invalid Link',
          description: 'The reset link is missing or invalid.',
          duration: 3000
        });
        toggleCurrentView('forgot');
        return;
      }

      try {
        const emailFromCode = await verifyPasswordResetCode(auth, oobCode);
        setEmail(emailFromCode);
      } catch (error: unknown) {
        let errorMessage = 'Invalid or expired password reset link.';

        if (axios.isAxiosError(error)) {
          const resp = error.response;
          if (resp?.data) {
            const data = resp.data as Record<string, unknown> | string;
            if (typeof data === 'string') {
              errorMessage = data;
            } else if (data && typeof data === 'object') {
              const dataObj = data as Record<string, unknown>;
              if ('error' in dataObj && typeof dataObj.error === 'string') {
                errorMessage = dataObj.error;
              } else if (
                'message' in dataObj &&
                typeof dataObj.message === 'string'
              ) {
                errorMessage = dataObj.message;
              } else {
                errorMessage = JSON.stringify(dataObj);
              }
            }
          } else {
            errorMessage = error.message;
          }
        } else if (error && typeof error === 'object' && 'code' in error) {
          const parsedError = firebaseErrorParser(
            error as Record<string, unknown> & {
              code: string;
              message: string;
              httpCode?: number;
            }
          );
          errorMessage = parsedError.message;
        } else if (error instanceof Error && error.message) {
          errorMessage = error.message;
        }

        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
          duration: 4000
        });
        toggleCurrentView('forgot');
      }
    };

    verifyCode();
  }, [oobCode, toast, toggleCurrentView]);

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!oobCode) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Reset link is missing or invalid.',
        duration: 3000
      });
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, values.password);

      toast({
        title: 'Success',
        description: 'Your password has been reset successfully.',
        duration: 3000
      });

      reset();
      toggleCurrentView('login');
    } catch (error: unknown) {
      let errorMessage = 'Failed to reset your password.';

      if (axios.isAxiosError(error)) {
        const resp = error.response;
        if (resp?.data) {
          const data = resp.data as Record<string, unknown> | string;
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (data && typeof data === 'object') {
            const dataObj = data as Record<string, unknown>;
            if ('error' in dataObj && typeof dataObj.error === 'string') {
              errorMessage = dataObj.error;
            } else if (
              'message' in dataObj &&
              typeof dataObj.message === 'string'
            ) {
              errorMessage = dataObj.message;
            } else {
              errorMessage = JSON.stringify(dataObj);
            }
          }
        } else {
          errorMessage = error.message;
        }
      } else if (error && typeof error === 'object' && 'code' in error) {
        const parsedError = firebaseErrorParser(
          error as Record<string, unknown> & {
            code: string;
            message: string;
            httpCode?: number;
          }
        );
        errorMessage = parsedError.message;
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      setError('password', {
        type: 'server',
        message: errorMessage
      });

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
        duration: 3000
      });
    }
  };

  return (
    <Card className="w-full max-w-md shadow-medium border-0">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-accent-foreground" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Reset Password
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Enter your new password
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="reset-email"
            className="text-sm font-medium text-foreground"
          >
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="reset-email"
              type="email"
              placeholder="Email"
              value={email}
              className="pl-10 border-border focus:ring-accent"
              disabled
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Password */}
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

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label
              htmlFor="confirm-password"
              className="text-sm font-medium text-foreground"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className="pl-10 pr-10 border-border focus:ring-accent"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="login"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Resetting your password...' : 'Reset Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export const ResetPassword = memo(ResetPasswordComponent);

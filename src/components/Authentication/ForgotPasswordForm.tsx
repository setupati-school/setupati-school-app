// src/components/auth/ForgotPasswordForm.tsx
import React, { memo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';

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
import { Mail, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { firebaseErrorParser } from '@/lib/firebaseErrorParser';
import { BACKEND_URL } from '@/lib/utils';
import { forgotPasswordSchema } from '@/components/zod';

interface ForgotPasswordFormProps {
  toggleCurrentView: (view: 'login' | 'forgot' | 'reset') => void;
}

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordFormComponent: React.FC<ForgotPasswordFormProps> = ({
  toggleCurrentView
}) => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onSubmit'
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await axios.post(`${BACKEND_URL}/api/v1/auth/validateEmail`, {
        email: values.email
      });

      await sendPasswordResetEmail(auth, values.email);

      setIsSubmitted(true);

      toast({
        title: 'Success',
        description: 'Email validated and reset link sent to your email.',
        duration: 3000
      });
    } catch (error: unknown) {
      let errorMessage =
        'No user found with this email or failed to send reset email.';

      // Prefer Axios errors (backend responses) first
      if (axios.isAxiosError(error)) {
        const resp = error.response;
        if (resp?.data) {
          // backend returns { error: string } or { message: string }
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
          // no response (network error)
          errorMessage = error.message;
        }
      } else if (error && typeof error === 'object' && 'code' in error) {
        // Firebase client-side error
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

      setIsSubmitted(false);
      setError('email', {
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
          <Mail className="w-8 h-8 text-accent-foreground" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Reset Password
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Enter your email address and we'll send you a reset link
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                placeholder="Enter your email address"
                className="pl-10 border-border focus:ring-accent"
                disabled={isSubmitted}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="login"
            size="lg"
            disabled={isSubmitted || isSubmitting}
            className="w-full"
          >
            {isSubmitted
              ? 'Link Sent! Check Your Email'
              : isSubmitting
                ? 'Validating...'
                : 'Confirm Your Email Address'}
          </Button>
        </form>

        <Button
          onClick={() => toggleCurrentView('login')}
          variant="ghost"
          size="lg"
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>
      </CardContent>
    </Card>
  );
};

export const ForgotPasswordForm = memo(ForgotPasswordFormComponent);

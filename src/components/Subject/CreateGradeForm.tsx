import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { BACKEND_URL } from '@/lib/utils';
import { Grade } from '@/types/schoolStoreType';
import { Loader2 } from 'lucide-react';

const gradeSchema = z.object({
  grade_name: z
    .string()
    .min(1, 'Grade name is required')
    .max(50, 'Grade name is too long')
});

type GradeFormData = z.infer<typeof gradeSchema>;

const getAuthToken = async (): Promise<string | null> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

interface CreateGradeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade?: Grade | null;
  onSuccess: () => void;
}

export const CreateGradeForm: React.FC<CreateGradeFormProps> = ({
  open,
  onOpenChange,
  grade,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEditing = !!grade;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      grade_name: ''
    }
  });

  useEffect(() => {
    if (grade) {
      reset({
        grade_name: grade.grade_name || ''
      });
    } else {
      reset({
        grade_name: ''
      });
    }
  }, [grade, reset, open]);

  const onSubmit: SubmitHandler<GradeFormData> = async (data) => {
    if (loading) return;
    setLoading(true);

    try {
      const token = await getAuthToken();
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to perform this action',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        ...data,
        section_ids: grade?.section_ids || [],
        subject_ids: grade?.subject_ids || []
      };

      if (isEditing && grade) {
        await axios.put(
          `${BACKEND_URL}/grades/update/${grade.id}`,
          payload,
          { headers }
        );
        toast({
          title: 'Success',
          description: 'Grade updated successfully'
        });
      } else {
        await axios.post(`${BACKEND_URL}/grades/create`, payload, {
          headers
        });
        toast({
          title: 'Success',
          description: 'Grade created successfully'
        });
      }

      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { status?: number; data?: { message?: string; error?: string } };
      };

      if (axiosError.response?.status === 401) {
        toast({
          title: 'Authentication Failed',
          description: 'Please log in again to continue',
          variant: 'destructive'
        });
      } else if (axiosError.response?.status === 403) {
        toast({
          title: 'Access Denied',
          description: 'Only administrators can create or edit grades',
          variant: 'destructive'
        });
      } else {
        const msg =
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          (err instanceof Error
            ? err.message
            : `Failed to ${isEditing ? 'update' : 'create'} grade`);

        toast({ title: 'Error', description: msg, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Grade' : 'Create New Grade'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="grade_name">Grade Name *</Label>
            <Input
              id="grade_name"
              placeholder="e.g., Grade 1, Class 10"
              {...register('grade_name')}
            />
            {errors.grade_name && (
              <p className="text-sm text-destructive">
                {errors.grade_name.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Grade' : 'Create Grade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGradeForm;

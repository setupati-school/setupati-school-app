import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/text-area';
import { useToast } from '@/hooks/use-toast';
import { BACKEND_URL } from '@/lib/utils';
import { Subject, Grade, Teacher } from '@/types/schoolStoreType';
import { Loader2 } from 'lucide-react';
import {getAuthToken} from '@lib/utils';

const subjectSchema = z.object({
  subject_name: z
    .string()
    .min(1, 'Subject name is required')
    .max(100, 'Subject name is too long'),
  grade_id: z.string().min(1, 'Please select a grade'),
  teacher_id: z.string().min(1, 'Please select a teacher'),
  description: z.string().optional()
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface CreateSubjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject | null;
  grades: Grade[];
  teachers: Teacher[];
  onSuccess: () => void;
}

export const CreateSubjectForm: React.FC<CreateSubjectFormProps> = ({
  open,
  onOpenChange,
  subject,
  grades,
  teachers,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEditing = !!subject;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      subject_name: '',
      grade_id: '',
      teacher_id: '',
      description: ''
    }
  });

  useEffect(() => {
    if (subject) {
      reset({
        subject_name: subject?.subject_name,
        grade_id: subject?.grade_id,
        teacher_id: subject?.teacher_id || '',
        description: subject?.description || ''
      });
    } else {
      reset({
        subject_name: '',
        grade_id: '',
        teacher_id: '',
        description: ''
      });
    }
  }, [subject, reset, open]);

  const onSubmit: SubmitHandler<SubjectFormData> = async (data) => {
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
        subject_name: data?.subject_name,
        grade_id: data?.grade_id,
        teacher_id: data?.teacher_id,
        description: data?.description || null
      };

      if (isEditing && subject) {
        await axios.put(
          `${BACKEND_URL}/subjects/update/${subject?.id}`,
          payload,
          { headers }
        );
        toast({
          title: 'Success',
          description: 'Subject updated successfully'
        });
      } else {
        await axios.post(`${BACKEND_URL}/subjects/create`, payload, {
          headers
        });
        toast({
          title: 'Success',
          description: 'Subject created successfully'
        });
      }

      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          status?: number;
          data?: { message?: string; error?: string };
        };
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
          description: 'Only administrators can create or edit subjects',
          variant: 'destructive'
        });
      } else {
        const msg =
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          (err instanceof Error
            ? err.message
            : `Failed to ${isEditing ? 'update' : 'create'} subject`);

        toast({ title: 'Error', description: msg, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Subject' : 'Create New Subject'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject_name">Subject Name *</Label>
            <Input
              id="subject_name"
              placeholder="Enter subject name"
              {...register('subject_name')}
            />
            {errors?.subject_name && (
              <p className="text-sm text-destructive">
                {errors?.subject_name?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Grade *</Label>
            <Controller
              control={control}
              name="grade_id"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field?.value ?? ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade?.grade_id} value={grade?.grade_id}>
                        {grade?.grade_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors?.grade_id && (
              <p className="text-sm text-destructive">
                {errors?.grade_id?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Teacher *</Label>
            <Controller
              control={control}
              name="teacher_id"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field?.value ?? ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher?.teacher_id} value={teacher?.teacher_id}>
                        {teacher?.first_name} {teacher?.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors?.teacher_id && (
              <p className="text-sm text-destructive">
                {errors?.teacher_id?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter subject description (optional)"
              {...register('description')}
              rows={3}
            />
            {errors?.description && (
              <p className="text-sm text-destructive">
                {errors?.description?.message}
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
              {isEditing ? 'Update Subject' : 'Create Subject'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSubjectForm;

import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/text-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BACKEND_URL } from '@/lib/utils';
import { Circular } from '@/types/schoolStoreType';
import { Loader2 } from 'lucide-react';

const circularSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description is too long'),
  issued_by: z.string().min(1, 'Issued by is required'),
  targeted_group: z.enum(['All', 'Students', 'Teachers', 'Parents'], {
    required_error: 'Please select a target group'
  }),
  issued_date: z.string().min(1, 'Issue date is required'),
  valid_until: z.string().min(1, 'Expiry date is required')
});

type CircularFormData = z.infer<typeof circularSchema>;

// Helper function to get auth token
const getAuthToken = async (): Promise<string | null> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

interface CreateCircularFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  circular?: Circular | null;
  onSuccess: () => void;
}

export const CreateCircularForm: React.FC<CreateCircularFormProps> = ({
  open,
  onOpenChange,
  circular,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEditing = !!circular;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<CircularFormData>({
    resolver: zodResolver(circularSchema),
    defaultValues: {
      title: '',
      description: '',
      issued_by: '',
      targeted_group: 'All',
      issued_date: new Date().toISOString().split('T')[0],
      valid_until: ''
    }
  });

  useEffect(() => {
    if (circular) {
      reset({
        title: circular.title,
        description: circular.description,
        issued_by: circular.issued_by,
        targeted_group: circular.targeted_group as
          | 'All'
          | 'Students'
          | 'Teachers'
          | 'Parents',
        issued_date: circular.issued_date.split('T')[0],
        valid_until: circular.valid_until.split('T')[0]
      });
    } else {
      reset({
        title: '',
        description: '',
        issued_by: '',
        targeted_group: 'All',
        issued_date: new Date().toISOString().split('T')[0],
        valid_until: ''
      });
    }
  }, [circular, reset, open]);

  const onSubmit: SubmitHandler<CircularFormData> = async (data) => {
    if (loading) return;
    setLoading(true);

    try {
      const token = await getAuthToken();
      const headers = {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      };

      const payload = {
        ...data,
        issued_date: new Date(data.issued_date).toISOString(),
        valid_until: new Date(data.valid_until).toISOString()
      };

      if (isEditing && circular) {
        await axios.put(`${BACKEND_URL}/circulars/update/${circular.id}`, payload, {
          headers
        });
        toast({
          title: 'Success',
          description: 'Circular updated successfully'
        });
      } else {
        await axios.post(`${BACKEND_URL}/circulars/create`, payload, {
          headers
        });
        toast({
          title: 'Success',
          description: 'Circular created successfully'
        });
      }

      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const backendError = (err as { response?: { data?: unknown } })?.response
        ?.data as Record<string, unknown> | undefined;

      const msg =
        (backendError && (backendError.error as string)) ||
        (err instanceof Error
          ? err.message
          : `Failed to ${isEditing ? 'update' : 'create'} circular`);

      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Circular' : 'Create New Circular'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter circular title"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter circular description..."
              className="min-h-[120px]"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issued_by">Issued By *</Label>
              <Input
                id="issued_by"
                placeholder="e.g. Principal, Admin Office"
                {...register('issued_by')}
              />
              {errors.issued_by && (
                <p className="text-sm text-destructive">
                  {errors.issued_by.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Target Group *</Label>
              <Controller
                control={control}
                name="targeted_group"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Students">Students</SelectItem>
                      <SelectItem value="Teachers">Teachers</SelectItem>
                      <SelectItem value="Parents">Parents</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.targeted_group && (
                <p className="text-sm text-destructive">
                  {errors.targeted_group.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issued_date">Issue Date *</Label>
              <Input id="issued_date" type="date" {...register('issued_date')} />
              {errors.issued_date && (
                <p className="text-sm text-destructive">
                  {errors.issued_date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid_until">Valid Until *</Label>
              <Input
                id="valid_until"
                type="date"
                {...register('valid_until')}
              />
              {errors.valid_until && (
                <p className="text-sm text-destructive">
                  {errors.valid_until.message}
                </p>
              )}
            </div>
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
              {isEditing ? 'Update Circular' : 'Create Circular'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCircularForm;

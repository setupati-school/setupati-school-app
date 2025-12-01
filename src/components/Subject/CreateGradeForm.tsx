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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { BACKEND_URL } from '@/lib/utils';
import { Grade, Teacher, Section, Subject } from '@/types/schoolStoreType';
import { Loader2, X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const gradeSchema = z.object({
  grade_name: z
    .string()
    .min(1, 'Grade name is required')
    .max(50, 'Grade name is too long'),
  grade_id: z.string().min(1, 'Grade ID is required'),
  ahm_staff_id: z.string().min(1, 'AHM Staff ID is required'),
  teacher_id: z.string().min(1, 'Teacher is required'),
  section_ids: z.array(z.string()).min(1, 'At least one section is required'),
  subject_names: z.array(z.string()).min(1, 'At least one subject is required')
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
  teachers: Teacher[];
  sections: Section[];
  subjects: Subject[];
}

export const CreateGradeForm: React.FC<CreateGradeFormProps> = ({
  open,
  onOpenChange,
  grade,
  onSuccess,
  teachers,
  sections,
  subjects
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const isEditing = !!grade;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      grade_name: '',
      grade_id: '',
      ahm_staff_id: '',
      teacher_id: '',
      section_ids: [],
      subject_names: []
    }
  });

  const selectedSectionIds = watch('section_ids') || [];
  const selectedSubjectNames = watch('subject_names') || [];

  useEffect(() => {
    if (grade) {
      reset({
        grade_name: grade.grade_name || '',
        grade_id: grade.id || '',
        ahm_staff_id: grade.ahm_staff_id || '',
        teacher_id: '',
        section_ids: grade.section_ids || [],
        subject_names: grade.subject_name || []
      });
    } else {
      reset({
        grade_name: '',
        grade_id: '',
        ahm_staff_id: '',
        teacher_id: '',
        section_ids: [],
        subject_names: []
      });
    }
  }, [grade, reset, open]);

  const handleSectionToggle = (sectionId: string) => {
    const current = selectedSectionIds;
    const updated = current.includes(sectionId)
      ? current.filter((id) => id !== sectionId)
      : [...current, sectionId];
    setValue('section_ids', updated, { shouldValidate: true });
  };

  const handleAddSubject = () => {
    if (
      newSubjectName.trim() &&
      !selectedSubjectNames.includes(newSubjectName.trim())
    ) {
      setValue(
        'subject_names',
        [...selectedSubjectNames, newSubjectName.trim()],
        { shouldValidate: true }
      );
      setNewSubjectName('');
    }
  };

  const handleRemoveSubject = (subjectName: string) => {
    setValue(
      'subject_names',
      selectedSubjectNames.filter((name) => name !== subjectName),
      { shouldValidate: true }
    );
  };

  const handleSubjectToggle = (subjectName: string) => {
    const current = selectedSubjectNames;
    const updated = current.includes(subjectName)
      ? current.filter((name) => name !== subjectName)
      : [...current, subjectName];
    setValue('subject_names', updated, { shouldValidate: true });
  };

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
        grade_name: data.grade_name,
        grade_id: data.grade_id,
        ahm_staff_id: data.ahm_staff_id,
        teacher_id: data.teacher_id,
        section_id: data.section_ids,
        subject_name: data.subject_names
      };

      if (isEditing && grade) {
        await axios.put(`${BACKEND_URL}/grades/update/${grade.id}`, payload, {
          headers
        });
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Grade' : 'Create New Grade'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Grade ID */}
          <div className="space-y-2">
            <Label htmlFor="grade_id">Grade ID *</Label>
            <Input
              id="grade_id"
              placeholder="e.g., 1, 2, 3"
              {...register('grade_id')}
            />
            {errors.grade_id && (
              <p className="text-sm text-destructive">
                {errors.grade_id.message}
              </p>
            )}
          </div>

          {/* Grade Name */}
          <div className="space-y-2">
            <Label htmlFor="grade_name">Grade Name *</Label>
            <Input
              id="grade_name"
              placeholder="e.g., Grade_001, Class 10"
              {...register('grade_name')}
            />
            {errors.grade_name && (
              <p className="text-sm text-destructive">
                {errors.grade_name.message}
              </p>
            )}
          </div>

          {/* AHM Staff ID */}
          <div className="space-y-2">
            <Label htmlFor="ahm_staff_id">AHM Staff ID *</Label>
            <Input
              id="ahm_staff_id"
              placeholder="e.g., 3"
              {...register('ahm_staff_id')}
            />
            {errors.ahm_staff_id && (
              <p className="text-sm text-destructive">
                {errors.ahm_staff_id.message}
              </p>
            )}
          </div>

          {/* Teacher Selection */}
          <div className="space-y-2">
            <Label>Teacher *</Label>
            <Controller
              control={control}
              name="teacher_id"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.teacher_id && (
              <p className="text-sm text-destructive">
                {errors.teacher_id.message}
              </p>
            )}
          </div>

          {/* Section Selection (Multi-select with checkboxes) */}
          <div className="space-y-2">
            <Label>Sections *</Label>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
              {sections.length > 0 ? (
                sections.map((section) => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`section-${section.id}`}
                      checked={selectedSectionIds.includes(section.id)}
                      onCheckedChange={() => handleSectionToggle(section.id)}
                    />
                    <label
                      htmlFor={`section-${section.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {section.section_name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No sections available
                </p>
              )}
            </div>
            {errors.section_ids && (
              <p className="text-sm text-destructive">
                {errors.section_ids.message}
              </p>
            )}
          </div>

          {/* Subject Names (Multi-select + custom add) */}
          <div className="space-y-2">
            <Label>Subjects *</Label>

            {/* Selected subjects as badges */}
            {selectedSubjectNames.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedSubjectNames.map((subjectName) => (
                  <Badge
                    key={subjectName}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {subjectName}
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(subjectName)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Select from existing subjects */}
            <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subject-${subject.id}`}
                      checked={selectedSubjectNames.includes(
                        subject.subject_name
                      )}
                      onCheckedChange={() =>
                        handleSubjectToggle(subject.subject_name)
                      }
                    />
                    <label
                      htmlFor={`subject-${subject.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {subject.subject_name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No existing subjects
                </p>
              )}
            </div>

            {/* Add new subject name */}
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add new subject name"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubject();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddSubject}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {errors.subject_names && (
              <p className="text-sm text-destructive">
                {errors.subject_names.message}
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

import React, { useState, useEffect, useMemo } from 'react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BACKEND_URL } from '@/lib/utils';
import { Timetable, DayOfWeek } from '@/types/schoolStoreType';
import { useSchoolStore } from '@/store/schoolStore';
import { Loader2 } from 'lucide-react';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const timetableSchema = z.object({
  day_of_week: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], {
    required_error: 'Please select a day'
  }),
  period: z.number().min(1, 'Period must be at least 1').max(8, 'Period cannot exceed 8'),
  section_id: z.string().min(1, 'Please select a section'),
  subject_id: z.string().min(1, 'Please select a subject'),
  teacher_id: z.string().min(1, 'Please select a teacher')
});

type TimetableFormData = z.infer<typeof timetableSchema>;

const getAuthToken = async (): Promise<string | null> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

interface CreateTimetableFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timetable?: Timetable | null;
  onSuccess: () => void;
  preSelectedSection?: string;
  preSelectedGrade?: string;
}

export const CreateTimetableForm: React.FC<CreateTimetableFormProps> = ({
  open,
  onOpenChange,
  timetable,
  onSuccess,
  preSelectedSection,
  preSelectedGrade
}) => {
  const { toast } = useToast();
  const { sections, subjects, teachers, grades } = useSchoolStore();
  const [loading, setLoading] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState<string>(preSelectedGrade || '');
  const isEditing = !!timetable?.id;

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<TimetableFormData>({
    resolver: zodResolver(timetableSchema),
    defaultValues: {
      day_of_week: 'Monday',
      period: 1,
      section_id: preSelectedSection || '',
      subject_id: '',
      teacher_id: ''
    }
  });

  const watchedSectionId = watch('section_id');

  // Filter sections by selected grade using grade's section_ids
  const filteredSections = useMemo(() => {
    if (!selectedGradeId) return sections;
    const selectedGradeData = grades.find(g => g.id === selectedGradeId);
    if (!selectedGradeData?.section_ids?.length) return [];
    return sections.filter(s => selectedGradeData.section_ids.includes(s.id));
  }, [sections, grades, selectedGradeId]);

  // Get grade_id from selected section
  const selectedSection = useMemo(() => {
    return sections.find(s => s.id === watchedSectionId);
  }, [sections, watchedSectionId]);

  // Filter subjects by grade using grade's subject_ids
  const filteredSubjects = useMemo(() => {
    if (selectedGradeId) {
      const selectedGradeData = grades.find(g => g.id === selectedGradeId);
      if (!selectedGradeData?.subject_ids?.length) return subjects;
      return subjects.filter(s => selectedGradeData.subject_ids.includes(s.id));
    }
    return subjects;
  }, [subjects, grades, selectedGradeId]);

  // Handle grade change - reset section and subject
  const handleGradeChange = (gradeId: string) => {
    setSelectedGradeId(gradeId);
    setValue('section_id', '');
    setValue('subject_id', '');
  };

  useEffect(() => {
    if (timetable) {
      // Set grade from section
      const section = sections.find(s => s.id === timetable.section_id);
      if (section) {
        setSelectedGradeId(section.grade_id);
      }
      reset({
        day_of_week: timetable.day_of_week,
        period: timetable.period,
        section_id: timetable.section_id || preSelectedSection || '',
        subject_id: timetable.subject_id || '',
        teacher_id: timetable.teacher_id || ''
      });
    } else {
      setSelectedGradeId(preSelectedGrade || '');
      reset({
        day_of_week: 'Monday',
        period: 1,
        section_id: preSelectedSection || '',
        subject_id: '',
        teacher_id: ''
      });
    }
  }, [timetable, reset, open, preSelectedSection, preSelectedGrade, sections]);

  const onSubmit: SubmitHandler<TimetableFormData> = async (data) => {
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isEditing && timetable) {
        await axios.put(`${BACKEND_URL}/timetables/update/${timetable.id}`, payload, {
          headers
        });
        toast({
          title: 'Success',
          description: 'Timetable entry updated successfully'
        });
      } else {
        await axios.post(`${BACKEND_URL}/timetables/create`, payload, {
          headers
        });
        toast({
          title: 'Success',
          description: 'Timetable entry created successfully'
        });
      }

      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { message?: string; error?: string } } };

      if (axiosError.response?.status === 401) {
        toast({
          title: 'Authentication Failed',
          description: 'Please log in again to continue',
          variant: 'destructive'
        });
      } else if (axiosError.response?.status === 403) {
        toast({
          title: 'Access Denied',
          description: 'Only administrators can manage timetables',
          variant: 'destructive'
        });
      } else {
        const msg =
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          (err instanceof Error
            ? err.message
            : `Failed to ${isEditing ? 'update' : 'create'} timetable entry`);

        toast({ title: 'Error', description: msg, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Grade and Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grade *</Label>
              <Select
                onValueChange={handleGradeChange}
                value={selectedGradeId}
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
            </div>

            <div className="space-y-2">
              <Label>Section *</Label>
              <Controller
                control={control}
                name="section_id"
                render={({ field }) => (
                  <Select
                    onValueChange={field?.onChange}
                    value={field?.value ?? ''}
                    disabled={!selectedGradeId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedGradeId ? "Select section" : "Select grade first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSections.map((section) => (
                        <SelectItem key={section?.id} value={section?.id}>
                          {section?.section_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors?.section_id && (
                <p className="text-sm text-destructive">{errors?.section_id?.message}</p>
              )}
            </div>
          </div>

          {/* Day and Period */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Day *</Label>
              <Controller
                control={control}
                name="day_of_week"
                render={({ field }) => (
                  <Select
                    onValueChange={field?.onChange}
                    value={field?.value ?? ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors?.day_of_week && (
                <p className="text-sm text-destructive">{errors?.day_of_week?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Period *</Label>
              <Controller
                control={control}
                name="period"
                render={({ field }) => (
                  <Select
                    onValueChange={(v) => field.onChange(parseInt(v, 10))}
                    value={field.value?.toString() ?? ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIODS.map((period) => (
                        <SelectItem key={period} value={period.toString()}>
                          Period {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors?.period && (
                <p className="text-sm text-destructive">{errors?.period?.message}</p>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label>Subject *</Label>
            <Controller
              control={control}
              name="subject_id"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubjects.map((subject) => (
                      <SelectItem key={subject?.id} value={subject?.id}>
                        {subject?.subject_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors?.subject_id && (
              <p className="text-sm text-destructive">{errors?.subject_id?.message}</p>
            )}
          </div>

          {/* Teacher */}
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
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher?.id} value={teacher?.id}>
                        {teacher?.first_name} {teacher?.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors?.teacher_id && (
              <p className="text-sm text-destructive">{errors?.teacher_id?.message}</p>
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
              {isEditing ? 'Update Entry' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTimetableForm;

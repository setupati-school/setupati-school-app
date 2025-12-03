import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/axiosConfig';
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
import { Timetable, DayOfWeek } from '@/types/schoolStoreType';
import { useSchoolStore } from '@/store/schoolStore';
import { Loader2 } from 'lucide-react';
import { timetableSchema } from '@/components/zod';
import { DAYS_OF_WEEK, PERIODS } from '../../lib/utils';

type TimetableFormData = z.infer<typeof timetableSchema>;

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
  const isEditing = !!(timetable?.timetable_id || timetable?.id);

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
    const selectedGradeData = grades.find(g => g?.grade_id === selectedGradeId || g?.id === selectedGradeId);
    if (selectedGradeData?.section_ids?.length) {
      // Filter sections that are in the grade's section_ids array
      return sections.filter(s =>
        selectedGradeData?.section_ids.includes(s?.section_id) ||
        selectedGradeData?.section_ids.includes(s?.id)
      );
    }
    // Fallback: filter by section's grade_id
    return sections.filter(s => s?.grade_id === selectedGradeId);
  }, [sections, grades, selectedGradeId]);

  // Get grade_id from selected section
  const selectedSection = useMemo(() => {
    return sections.find(s => s?.section_id === watchedSectionId || s?.id === watchedSectionId);
  }, [sections, watchedSectionId]);

  // Filter subjects by grade using grade's subject_ids
  const filteredSubjects = useMemo(() => {
    if (selectedGradeId) {
      const selectedGradeData = grades.find(g => g?.grade_id === selectedGradeId || g?.id === selectedGradeId);
      if (!selectedGradeData?.subject_ids?.length) return subjects;
      return subjects.filter(s =>
        selectedGradeData?.subject_ids.includes(s?.subject_id) ||
        selectedGradeData?.subject_ids.includes(s?.id)
      );
    }
    // Fallback: filter by subject's grade_id matching selected grade
    return subjects.filter(s => s?.grade_id === selectedGradeId || !selectedGradeId);
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
      const section = sections.find(s => s.id === timetable?.section_id || s.section_id === timetable?.section_id);
      if (section) {
        setSelectedGradeId(section?.grade_id);
      } else if (preSelectedGrade) {
        setSelectedGradeId(preSelectedGrade);
      }
      reset({
        day_of_week: timetable?.day_of_week,
        period: timetable?.period,
        section_id: timetable?.section_id || preSelectedSection || '',
        subject_id: timetable?.subject_id || '',
        teacher_id: timetable?.teacher_id || ''
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
      const payload = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isEditing && timetable) {
        const timetableId = timetable?.timetable_id;
        await api.put(`/timetables/update/${timetableId}`, payload);
        toast({
          title: 'Success',
          description: 'Timetable entry updated successfully'
        });
      } else {
        await api.post('/timetables/create', payload);
        toast({
          title: 'Success',
          description: 'Timetable entry created successfully'
        });
      }

      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: 'There was an error saving the timetable entry.',
        variant: 'destructive'
      });
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
                        <SelectItem key={section?.section_id} value={section?.section_id}>
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
                      {PERIODS.map((p) => (
                        <SelectItem key={p?.period} value={p?.period.toString()}>
                          Period {p?.period} ({p?.startTime} - {p?.endTime})
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
                      <SelectItem key={subject?.subject_id || subject?.id} value={subject?.subject_id || subject?.id}>
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
                      <SelectItem key={teacher?.teacher_id || teacher?.id} value={teacher?.teacher_id || teacher?.id}>
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

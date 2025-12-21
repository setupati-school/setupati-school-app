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
import { Input } from '@/components/ui/input';
import { firebaseErrorParser } from '@/lib/firebaseErrorParser';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ExamTimetable } from '@/types/schoolStoreType';
import { useSchoolStore } from '@/store/schoolStore';
import { Loader2 } from 'lucide-react';
import { examTimetableSchema } from '@/components/zod';
import { ExamType } from '@/types/schoolStoreType';
import { EXAM_TYPES } from '@/lib/utils';

type ExamTimetableFormData = z.infer<typeof examTimetableSchema>;

interface CreateExamTimetableFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examTimetable?: ExamTimetable | null;
  onSuccess: () => void;
  preSelectedGrade?: string;
  preSelectedExamType?: string;
}

export const CreateExamTimetableForm: React.FC<CreateExamTimetableFormProps> = ({
  open,
  onOpenChange,
  examTimetable,
  onSuccess,
  preSelectedGrade,
  preSelectedExamType
}) => {
  const { toast } = useToast();
  const { subjects, grades } = useSchoolStore();
  const [loading, setLoading] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState<string>(preSelectedGrade || '');
  const isEditing = !!(examTimetable?.exam_time_table_id || examTimetable?.id);

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    register,
    formState: { errors }
  } = useForm<ExamTimetableFormData>({
    resolver: zodResolver(examTimetableSchema),
    defaultValues: {
      grade_id: preSelectedGrade || '',
      subject_id: '',
      date: '',
      start_time: '',
      end_time: '',
      exam_type: (preSelectedExamType as ExamType) || 'Midterm'
    }
  });

  // Filter subjects by grade using grade's subject_ids
  const filteredSubjects = useMemo(() => {
    if (selectedGradeId) {
      const selectedGradeData = grades?.find(g => g?.grade_id === selectedGradeId || g?.id === selectedGradeId);
      if (!selectedGradeData?.subject_ids?.length) return subjects;
      return subjects?.filter(s =>
        selectedGradeData?.subject_ids?.includes(s?.subject_id || '') ||
        selectedGradeData?.subject_ids?.includes(s?.id || '')
      );
    }
    return subjects?.filter(s => s?.grade_id === selectedGradeId || !selectedGradeId);
  }, [subjects, grades, selectedGradeId]);

  // Handle grade change - reset subject
  const handleGradeChange = (gradeId: string) => {
    setSelectedGradeId(gradeId);
    setValue('grade_id', gradeId);
    setValue('subject_id', '');
  };

  useEffect(() => {
    if (examTimetable) {
      setSelectedGradeId(examTimetable?.grade_id || preSelectedGrade || '');
      reset({
        grade_id: examTimetable?.grade_id || preSelectedGrade || '',
        subject_id: examTimetable?.subject_id || '',
        date: examTimetable?.date || examTimetable?.exam_date || '',
        start_time: examTimetable?.start_time || '',
        end_time: examTimetable?.end_time || '',
        exam_type: examTimetable?.exam_type || (preSelectedExamType as ExamType) || 'Midterm'
      });
    } else {
      setSelectedGradeId(preSelectedGrade || '');
      reset({
        grade_id: preSelectedGrade || '',
        subject_id: '',
        date: '',
        start_time: '',
        end_time: '',
        exam_type: (preSelectedExamType as ExamType) || 'Midterm'
      });
    }
  }, [examTimetable, reset, open, preSelectedGrade, preSelectedExamType]);

  const onSubmit: SubmitHandler<ExamTimetableFormData> = async (data) => {
    if (loading) return;
    setLoading(true);

    try {
      const payload = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isEditing && examTimetable) {
        const examTimetableId = examTimetable?.exam_time_table_id || examTimetable?.id;
        await api.put(`/exam-timetables/update/${examTimetableId}`, payload);
        toast({
          title: 'Success',
          description: 'Exam timetable entry updated successfully'
        });
      } else {
        await api.post('/exam-timetables/create', payload);
        toast({
          title: 'Success',
          description: 'Exam timetable entry created successfully'
        });
      }

      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const { message } = firebaseErrorParser(error);
      toast({
        title: 'Error',
        description: message,
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
            {isEditing ? 'Edit Exam Timetable' : 'Add Exam Timetable'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Grade and Exam Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grade *</Label>
              <Controller
                control={control}
                name="grade_id"
                render={({ field }) => (
                  <Select
                    onValueChange={(v) => {
                      field.onChange(v);
                      handleGradeChange(v);
                    }}
                    value={field?.value ?? ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades?.map((grade) => (
                        <SelectItem key={grade?.grade_id} value={grade?.grade_id}>
                          {grade?.grade_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors?.grade_id && (
                <p className="text-sm text-destructive">{errors?.grade_id?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Exam Type *</Label>
              <Controller
                control={control}
                name="exam_type"
                render={({ field }) => (
                  <Select
                    onValueChange={field?.onChange}
                    value={field?.value ?? ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXAM_TYPES?.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors?.exam_type && (
                <p className="text-sm text-destructive">{errors?.exam_type?.message}</p>
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
                  onValueChange={field?.onChange}
                  value={field?.value ?? ''}
                  disabled={!selectedGradeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedGradeId ? "Select subject" : "Select grade first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubjects?.map((subject) => (
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

          {/* Exam Date */}
          <div className="space-y-2">
            <Label>Exam Date *</Label>
            <Input
              type="date"
              {...register('date')}
            />
            {errors?.date && (
              <p className="text-sm text-destructive">{errors?.date?.message}</p>
            )}
          </div>

          {/* Start Time and End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Input
                type="time"
                {...register('start_time')}
              />
              {errors?.start_time && (
                <p className="text-sm text-destructive">{errors?.start_time?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>End Time *</Label>
              <Input
                type="time"
                {...register('end_time')}
              />
              {errors?.end_time && (
                <p className="text-sm text-destructive">{errors?.end_time?.message}</p>
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
              {isEditing ? 'Update Entry' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExamTimetableForm;


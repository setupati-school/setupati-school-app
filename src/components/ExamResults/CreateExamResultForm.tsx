import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/axiosConfig';
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
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { PASS_THRESHOLD } from '@/lib/utils';
import { firebaseErrorParser } from '../../lib/firebaseErrorParser';
import e from 'cors';

interface SubjectScore {
  subject_id: string;
  marks: number;
}

interface ExamResultFormData {
  student_id: string;
  exam_id: string;
  subjects: SubjectScore[];
}

interface ExamResultData {
  id: string;
  student_id: string;
  exam_id: string;
  exam_result: {
    [key: string]: number | string;
    total: number;
    pass_or_fail: string;
  };
  created_at: string;
  updated_at: string;
}

interface CreateExamResultFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examResult?: ExamResultData | null;
  onSuccess: () => void;
}

export const CreateExamResultForm: React.FC<CreateExamResultFormProps> = ({
  open,
  onOpenChange,
  examResult,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<SubjectScore[]>([
    { subject_id: '', marks: 0 }
  ]);
  const isEditing = !!examResult;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ExamResultFormData>({
    defaultValues: {
      student_id: '',
      exam_id: ''
    }
  });

  useEffect(() => {
    if (examResult) {
      reset({
        student_id: examResult?.student_id,
        exam_id: examResult?.exam_id
      });

      const subjectEntries = Object.entries(examResult?.exam_result || {})
        .filter(([key]) => key.startsWith('subject_'))
        .map(([key, value]) => ({
          subject_id: key,
          marks: typeof value === 'number' ? value : 0
        }));

      setSubjects(subjectEntries.length > 0 ? subjectEntries : [{ subject_id: '', marks: 0 }]);
    } else {
      reset({
        student_id: '',
        exam_id: ''
      });
      setSubjects([{ subject_id: '', marks: 0 }]);
    }
  }, [examResult, reset, open]);

  const addSubject = () => {
    setSubjects([...subjects, { subject_id: '', marks: 0 }]);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index: number, field: keyof SubjectScore, value: string | number) => {
    const updated = [...subjects];
    if (field === 'marks') {
      updated[index][field] = Number(value);
    } else {
      updated[index][field] = String(value);
    }
    setSubjects(updated);
  };

  const calculateTotal = () => {
    return subjects.reduce((sum, s) => sum + (Number(s.marks) || 0), 0);
  };

  const determinePassFail = () => {
    const allPassed = subjects.every(s => (Number(s.marks) || 0) >= PASS_THRESHOLD);
    return allPassed ? 'pass' : 'fail';
  };

  const onSubmit = async (data: ExamResultFormData) => {
    if (loading) return;

    const validSubjects = subjects.filter(s => s.subject_id.trim() !== '');
    if (validSubjects.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one subject with marks',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const examResultPayload: Record<string, number | string> = {};
      validSubjects.forEach(s => {
        const subjectKey = s.subject_id.startsWith('subject_')
          ? s.subject_id
          : `subject_${s.subject_id.toLowerCase().replace(/\s+/g, '_')}`;
        examResultPayload[subjectKey] = Number(s.marks);
      });
      examResultPayload.total = calculateTotal();
      examResultPayload.pass_or_fail = determinePassFail();

      const payload = {
        student_id: data?.student_id,
        exam_id: data?.exam_id,
        exam_result: examResultPayload,
        created_at: isEditing ? examResult?.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isEditing && examResult) {
        await api.put(`/examresults/update/${examResult?.id}`, payload);
        toast({
          title: 'Success',
          description: 'Exam result updated successfully'
        });
      } else {
        await api.post('/examresults/create', payload);
        toast({
          title: 'Success',
          description: 'Exam result created successfully'
        });
      }

      reset();
      setSubjects([{ subject_id: '', marks: 0 }]);
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Exam Result' : 'Create New Exam Result'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student_id">Student ID *</Label>
              <Input
                id="student_id"
                placeholder="e.g., student_priya_01"
                {...register('student_id', { required: 'Student ID is required' })}
              />
              {errors?.student_id && (
                <p className="text-sm text-destructive">{errors?.student_id?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="exam_id">Exam ID *</Label>
              <Input
                id="exam_id"
                placeholder="e.g., annual_01_2025"
                {...register('exam_id', { required: 'Exam ID is required' })}
              />
              {errors?.exam_id && (
                <p className="text-sm text-destructive">{errors?.exam_id?.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Subject Marks *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSubject}>
                <Plus className="h-4 w-4 mr-1" />
                Add Subject
              </Button>
            </div>

            <div className="space-y-2">
              {subjects.map((subject, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Subject (e.g., english_01)"
                    value={subject?.subject_id}
                    onChange={(e) => updateSubject(index, 'subject_id', e?.target?.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Marks"
                    value={subject?.marks}
                    onChange={(e) => updateSubject(index, 'marks', e?.target?.value)}
                    className="w-24"
                    min={0}
                    max={100}
                  />
                  {subjects.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSubject(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Marks:</span>
              <span className="font-semibold">{calculateTotal()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className={`font-semibold ${determinePassFail() === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                {determinePassFail().toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Pass threshold: {PASS_THRESHOLD} marks per subject
            </p>
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
              {isEditing ? 'Update Result' : 'Create Result'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExamResultForm;

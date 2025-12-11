import { z } from 'zod';

const examTypeEnum = z.enum([
  'Unit Test',
  'Quarterly',
  'Half-Yearly',
  'Annual'
]);

export const createExamTimetableSchema = z.object({
  grade_id: z
    .string({ required_error: 'Grade ID is required' })
    .min(1, 'Grade ID is required'),
  subject_id: z
    .string({ required_error: 'Subject ID is required' })
    .min(1, 'Subject ID is required'),
  date: z
    .string({ required_error: 'Exam date is required' })
    .min(1, 'Exam date is required'),
  start_time: z
    .string({ required_error: 'Start time is required' })
    .min(1, 'Start time is required'),
  end_time: z
    .string({ required_error: 'End time is required' })
    .min(1, 'End time is required'),
  exam_type: examTypeEnum
});

export const updateExamTimetableSchema = createExamTimetableSchema.partial();

export const examTimetableIdParamSchema = z.object({
  id: z
    .string({ required_error: 'Exam Timetable ID is required' })
    .min(1, 'Exam Timetable ID is required')
});

export type CreateExamTimetablePayload = z.infer<typeof createExamTimetableSchema>;
export type UpdateExamTimetablePayload = z.infer<typeof updateExamTimetableSchema>;
export type ExamTimetableIdParam = z.infer<typeof examTimetableIdParamSchema>;

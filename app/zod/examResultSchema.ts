import { z } from 'zod';

export const createExamResultSchema = z.object({
  student_id: z
    .string({ required_error: 'Student ID is required' })
    .min(1, 'Student ID is required'),
  exam_id: z
    .string({ required_error: 'Exam ID is required' })
    .min(1, 'Exam ID is required'),
  exam_result: z.record(z.union([z.number(), z.string()])).refine(
    (data) => {
      return typeof data.total === 'number' && typeof data.pass_or_fail === 'string';
    },
    { message: 'exam_result must contain total (number) and pass_or_fail (string)' }
  ),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const updateExamResultSchema = createExamResultSchema.partial();

export const examResultIdParamSchema = z.object({
  exam_result_id: z
    .string({ required_error: 'Exam Result ID is required' })
    .min(1, 'Exam Result ID is required')
});

export const studentIdParamSchema = z.object({
  student_id: z
    .string({ required_error: 'Student ID is required' })
    .min(1, 'Student ID is required')
});

export type CreateExamResultPayload = z.infer<typeof createExamResultSchema>;
export type UpdateExamResultPayload = z.infer<typeof updateExamResultSchema>;
export type ExamResultIdParam = z.infer<typeof examResultIdParamSchema>;
export type StudentIdParam = z.infer<typeof studentIdParamSchema>;

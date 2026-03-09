import { z } from 'zod';

const subjectMarkSchema = z.object({
  subject_id: z.string().min(1, 'Subject ID is required'),
  marks: z.number().nonnegative('Marks must be a non-negative number')
});

export const createExamResultSchema = z.object({
  student_id: z.string({ required_error: 'Student ID is required' }).min(1),
  exam_id: z.string({ required_error: 'Exam ID is required' }).min(1),
  subjects: z
    .array(subjectMarkSchema)
    .min(1, 'At least one subject mark is required'),
  total: z.number({ required_error: 'Total is required' }).nonnegative(),
  pass_or_fail: z.enum(['pass', 'fail'], { required_error: 'Pass or fail status is required' })
});

export const updateExamResultSchema = createExamResultSchema.partial();

export const examResultIdParamSchema = z.object({
  exam_result_id: z.string({ required_error: 'Exam Result ID is required' }).min(1)
});

export const studentIdParamSchema = z.object({
  student_id: z.string({ required_error: 'Student ID is required' }).min(1)
});

export const examIdParamSchema = z.object({
  exam_id: z.string({ required_error: 'Exam ID is required' }).min(1)
});

export type CreateExamResultPayload = z.infer<typeof createExamResultSchema>;
export type UpdateExamResultPayload = z.infer<typeof updateExamResultSchema>;
export type ExamResultIdParam = z.infer<typeof examResultIdParamSchema>;
export type StudentIdParam = z.infer<typeof studentIdParamSchema>;
export type ExamIdParam = z.infer<typeof examIdParamSchema>;

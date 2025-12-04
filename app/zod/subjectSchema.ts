import { z } from 'zod';

export const createSubjectSchema = z.object({
  subject_name: z
    .string({ required_error: 'Subject name is required' })
    .min(1, 'Subject name is required')
    .max(100, 'Subject name must be less than 100 characters'),
  grade_id: z
    .string({ required_error: 'Grade ID is required' })
    .min(1, 'Grade ID is required')
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const subjectIdParamSchema = z.object({
  subject_id: z
    .string({ required_error: 'Subject ID is required' })
    .min(1, 'Subject ID is required')
});

export type CreateSubjectPayload = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectPayload = z.infer<typeof updateSubjectSchema>;
export type SubjectIdParam = z.infer<typeof subjectIdParamSchema>;

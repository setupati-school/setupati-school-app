import { z } from 'zod';

const dayOfWeekEnum = z.enum([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]);

export const createTimetableSchema = z.object({
  day_of_week: dayOfWeekEnum,
  period: z
    .number({ required_error: 'Period is required' })
    .int('Period must be an integer')
    .min(1, 'Period must be at least 1')
    .max(8, 'Period must be at most 8'),
  section_id: z
    .string({ required_error: 'Section ID is required' })
    .min(1, 'Section ID is required'),
  subject_id: z
    .string({ required_error: 'Subject ID is required' })
    .min(1, 'Subject ID is required'),
  teacher_id: z
    .string({ required_error: 'Teacher ID is required' })
    .min(1, 'Teacher ID is required')
});

export const updateTimetableSchema = createTimetableSchema.partial();

export const timetableIdParamSchema = z.object({
  time_table_id: z
    .string({ required_error: 'Timetable ID is required' })
    .min(1, 'Timetable ID is required')
});

export type CreateTimetablePayload = z.infer<typeof createTimetableSchema>;
export type UpdateTimetablePayload = z.infer<typeof updateTimetableSchema>;
export type TimetableIdParam = z.infer<typeof timetableIdParamSchema>;

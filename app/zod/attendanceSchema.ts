import { z } from 'zod';

export const createAttendanceSchema = z.object({
  student_id: z.string({ required_error: 'Student ID is required' }).min(1),
  section_id: z.string({ required_error: 'Section ID is required' }).min(1),
  date: z.string({ required_error: 'Date is required' }).min(1),
  status: z.enum(['present', 'absent', 'late'], { required_error: 'Status is required' })
});

export const updateAttendanceSchema = createAttendanceSchema.partial();

export const attendanceIdParamSchema = z.object({
  attendance_id: z.string({ required_error: 'Attendance ID is required' }).min(1)
});

export type CreateAttendancePayload = z.infer<typeof createAttendanceSchema>;
export type UpdateAttendancePayload = z.infer<typeof updateAttendanceSchema>;
export type AttendanceIdParam = z.infer<typeof attendanceIdParamSchema>;

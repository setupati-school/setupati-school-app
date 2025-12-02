import { z } from 'zod';

const targetedGroupEnum = z.enum(['All', 'Students', 'Teachers', 'Parents']);

export const createCircularSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  issued_by: z
    .string({ required_error: 'Issued by is required' })
    .min(1, 'Issued by is required'),
  issued_date: z
    .string({ required_error: 'Issued date is required' })
    .min(1, 'Issued date is required'),
  valid_until: z
    .string({ required_error: 'Valid until date is required' })
    .min(1, 'Valid until date is required'),
  targeted_group: targetedGroupEnum,
  attachment_url: z.string().url('Invalid URL format').optional().nullable()
});

export const updateCircularSchema = createCircularSchema.partial();

export const circularIdParamSchema = z.object({
  circular_id: z
    .string({ required_error: 'Circular ID is required' })
    .min(1, 'Circular ID is required')
});

export type CreateCircularPayload = z.infer<typeof createCircularSchema>;
export type UpdateCircularPayload = z.infer<typeof updateCircularSchema>;
export type CircularIdParam = z.infer<typeof circularIdParamSchema>;

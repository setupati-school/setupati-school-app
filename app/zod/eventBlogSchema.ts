import { z } from 'zod';

const eventCategoryEnum = z.enum([
  'Sports',
  'Academic',
  'Cultural',
  'Ceremony',
  'Community',
  'Other'
]);

export const createEventBlogSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z
    .string({ required_error: 'Content is required' })
    .min(1, 'Content is required')
    .max(10000, 'Content must be less than 10000 characters'),
  category: eventCategoryEnum,
  event_date: z
    .string({ required_error: 'Event date is required' })
    .min(1, 'Event date is required'),
  author_name: z
    .string({ required_error: 'Author name is required' })
    .min(1, 'Author name is required'),
  author_id: z.string().optional(),
  images: z
    .array(z.string().url('Invalid image URL'))
    .max(10, 'Maximum 10 images allowed')
    .optional()
    .default([]),
  is_published: z.boolean().optional().default(true)
});

export const updateEventBlogSchema = createEventBlogSchema.partial();

export const eventBlogIdParamSchema = z.object({
  blog_id: z
    .string({ required_error: 'Blog ID is required' })
    .min(1, 'Blog ID is required')
});

export type CreateEventBlogPayload = z.infer<typeof createEventBlogSchema>;
export type UpdateEventBlogPayload = z.infer<typeof updateEventBlogSchema>;
export type EventBlogIdParam = z.infer<typeof eventBlogIdParamSchema>;
export type EventCategory = z.infer<typeof eventCategoryEnum>;

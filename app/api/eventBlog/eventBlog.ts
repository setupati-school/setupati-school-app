import { db } from '../../firebase.js';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from '../../utils/logger.js';
import { docsToFlat, docToFlat, now } from '../../utils/helper.js';

if (!db)
  throw new AppError('Database connection not established', HttpCode.INTERNAL_SERVER_ERROR);

type EventCategory = 'Sports' | 'Academic' | 'Cultural' | 'Ceremony' | 'Community' | 'Other';

interface EventBlog {
  title: string;
  content: string;
  category: EventCategory;
  event_date: string;
  author_name: string;
  author_id: string;
  images: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const eventBlogCollection = db.collection('event_blogs');

export const getAllEventBlogs = async (): Promise<(EventBlog & { id: string })[]> => {
  const snapshot = await eventBlogCollection.orderBy('event_date', 'desc').get();
  if (snapshot.empty) return [];
  return docsToFlat<EventBlog>(snapshot.docs);
};

export const getPublishedEventBlogs = async (): Promise<(EventBlog & { id: string })[]> => {
  const snapshot = await eventBlogCollection
    .where('is_published', '==', true)
    .orderBy('event_date', 'desc')
    .get();
  if (snapshot.empty) return [];
  return docsToFlat<EventBlog>(snapshot.docs);
};

export const getEventBlogsByAuthor = async (
  authorId: string
): Promise<(EventBlog & { id: string })[]> => {
  const snapshot = await eventBlogCollection
    .where('author_id', '==', authorId)
    .orderBy('event_date', 'desc')
    .get();
  if (snapshot.empty) return [];
  return docsToFlat<EventBlog>(snapshot.docs);
};

export const getEventBlogById = async (
  id: string
): Promise<(EventBlog & { id: string }) | null> => {
  const doc = await eventBlogCollection.doc(id).get();
  if (!doc.exists) return null;
  return docToFlat<EventBlog>(doc);
};

export const addEventBlog = async (
  data: Omit<EventBlog, 'created_at' | 'updated_at'>
): Promise<string> => {
  const docRef = await eventBlogCollection.add({
    ...data,
    images: data.images ?? [],
    is_published: data.is_published ?? true,
    created_at: now(),
    updated_at: now()
  });
  logger.info(`Event blog added with ID: ${docRef.id}`);
  return docRef.id;
};

export const updateEventBlog = async (
  id: string,
  data: Partial<EventBlog>
): Promise<boolean> => {
  const docRef = eventBlogCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No event blog found with ID: ${id}`);
    return false;
  }
  await docRef.update({ ...data, updated_at: now() });
  logger.info(`Updated event blog with ID: ${id}`);
  return true;
};

export const deleteEventBlog = async (id: string): Promise<boolean> => {
  const docRef = eventBlogCollection.doc(id);
  const doc = await docRef.get();
  if (!doc.exists) {
    logger.info(`No event blog found with ID: ${id}`);
    return false;
  }
  await docRef.delete();
  logger.info(`Deleted event blog with ID: ${id}`);
  return true;
};

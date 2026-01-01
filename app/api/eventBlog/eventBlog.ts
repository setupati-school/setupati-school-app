import { db } from '../../firebase.js';
import { AppError, HttpCode } from '../../Error/error.js';
import logger from '../../utils/logger.js';
import { mapDocsWithKey, now } from '../../utils/helper.js';
import type { CreateEventBlogPayload } from '../../zod/eventBlogSchema.js';

type EventBlog = CreateEventBlogPayload & {
  created_at?: string;
  updated_at?: string;
};

if (!db)
  throw new AppError(
    'Database or Auth connection not established',
    HttpCode.INTERNAL_SERVER_ERROR
  );

const eventBlogCollection = db.collection('event_blogs');

export const addEventBlog = async (data: EventBlog): Promise<string> => {
  const blogData = {
    ...data,
    images: data.images || [],
    is_published: data.is_published ?? true,
    created_at: now,
    updated_at: now
  };
  const docRef = await eventBlogCollection.add(blogData);
  logger.info(`Event blog added with ID: ${docRef?.id}`);
  return docRef.id;
};

export const getEventBlog = async (
  blogId: string
): Promise<{ id: string; eventBlog: EventBlog | null }[]> => {
  const docRef = eventBlogCollection.doc(blogId);
  const doc = await docRef.get();

  if (!doc.exists) {
    logger.info(`No event blog found with ID: ${blogId}`);
    return [{ id: '', eventBlog: null }];
  }

  return [{
    id: doc.id,
    eventBlog: doc.data() as EventBlog
  }];
};

export const deleteEventBlog = async (blogId: string): Promise<boolean> => {
  const docRef = eventBlogCollection.doc(blogId);
  const doc = await docRef.get();

  if (!doc.exists) {
    logger.info(`No event blog found to delete with ID: ${blogId}`);
    return false;
  }

  await docRef.delete();
  logger.info(`Deleted event blog with ID: ${blogId}`);
  return true;
};

export const getAllEventBlogs = async (): Promise<
  { id: string; eventBlog: EventBlog | null }[]
> => {
  const snapshot = await eventBlogCollection.get();
  if (snapshot.empty) {
    logger.info(`No event blogs found in the database`);
    return [];
  }
  logger.info(`Fetched all event blogs from the database`);
  return mapDocsWithKey<EventBlog, 'eventBlog'>(snapshot.docs, 'eventBlog');
};

export const getPublishedEventBlogs = async (): Promise<
  { id: string; eventBlog: EventBlog | null }[]
> => {
  const snapshot = await eventBlogCollection.get();

  if (snapshot.empty) {
    logger.info(`No event blogs found`);
    return [];
  }

  const publishedDocs = snapshot.docs.filter((doc) => {
    const data = doc.data();
    return data.is_published !== false;
  });

  if (publishedDocs.length === 0) {
    logger.info(`No published event blogs found`);
    return [];
  }

  logger.info(`Fetched ${publishedDocs.length} published event blogs from the database`);
  return mapDocsWithKey<EventBlog, 'eventBlog'>(publishedDocs, 'eventBlog');
};

export const getEventBlogsByAuthor = async (
  authorId: string
): Promise<{ id: string; eventBlog: EventBlog | null }[]> => {
  const snapshot = await eventBlogCollection
    .where('author_id', '==', authorId)
    .get();

  if (snapshot.empty) {
    logger.info(`No event blogs found for author: ${authorId}`);
    return [];
  }
  logger.info(`Fetched event blogs for author: ${authorId}`);
  return mapDocsWithKey<EventBlog, 'eventBlog'>(snapshot.docs, 'eventBlog');
};

export const updateEventBlog = async (
  blogId: string,
  data: Partial<EventBlog>
): Promise<boolean> => {
  logger.info(`Updating event blog with ID: ${blogId}`);

  const docRef = eventBlogCollection.doc(blogId);
  const doc = await docRef.get();

  if (!doc.exists) {
    logger.info(`No event blog found to update with ID: ${blogId}`);
    return false;
  }

  const updateData = {
    ...data,
    updated_at: now
  };

  await docRef.update(updateData);
  logger.info(`Updated event blog with ID: ${blogId}`);
  return true;
};

import { Request, Response } from 'express';
import logger from '../../utils/logger.js';
import {
  addEventBlog,
  deleteEventBlog,
  getAllEventBlogs,
  getPublishedEventBlogs,
  getEventBlogsByAuthor,
  getEventBlog,
  updateEventBlog
} from '../../api/eventBlog/eventBlog.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';

interface EventBlogWithDates extends Record<string, unknown> {
  event_date?: string;
  created_at?: string;
  updated_at?: string;
}

export const createEventBlog = async (req: Request, res: Response) => {
  try {
    const data = req?.body || {};
    const authorId = res.locals?.uid || '';

    const blogData = {
      ...data,
      author_id: authorId
    };

    const id = await addEventBlog(blogData);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating event blog:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const searchEventBlog = async (req: Request, res: Response) => {
  try {
    const { blog_id: blogId } = req?.params || {};
    const blogs = await getEventBlog(blogId);
    res.status(200).json(blogs);
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error searching for event blog:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteEventBlogDetails = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { blog_id: blogId } = req?.params || {};
    const deleted = await deleteEventBlog(blogId);
    logger.info('deleted event blog data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Event blog not found' });
    }
    res.status(204).json({});
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting event blog details:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllEventBlogsHandler = async (req: Request, res: Response) => {
  try {
    const rawBlogs = await getAllEventBlogs();

    const blogs = rawBlogs
      ?.filter((item) => item?.eventBlog !== null)
      ?.map((item) => ({
        id: item?.id,
        ...(item?.eventBlog as EventBlogWithDates)
      })) || [];

    blogs?.sort((a, b) => {
      const dateA = new Date(a?.event_date || 0).getTime();
      const dateB = new Date(b?.event_date || 0).getTime();
      return dateB - dateA;
    });

    res.status(200).json({ blogs });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all event blogs:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getPublishedEventBlogsHandler = async (req: Request, res: Response) => {
  try {
    logger.info('Fetching published event blogs for public gallery');
    const rawBlogs = await getPublishedEventBlogs();
    logger.info(`Raw blogs fetched: ${rawBlogs.length} items`);

    const blogs = rawBlogs
      ?.filter((item) => item?.eventBlog !== null)
      ?.map((item) => ({
        id: item?.id,
        ...(item?.eventBlog as EventBlogWithDates)
      })) || [];

    logger.info(`Processed blogs: ${blogs.length} items`);

    blogs?.sort((a, b) => {
      const dateA = new Date(a?.event_date || 0).getTime();
      const dateB = new Date(b?.event_date || 0).getTime();
      return dateB - dateA;
    });

    res.status(200).json({ blogs });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching published event blogs:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getMyEventBlogsHandler = async (req: Request, res: Response) => {
  try {
    const authorId = res.locals?.uid || '';
    const rawBlogs = await getEventBlogsByAuthor(authorId);

    const blogs = rawBlogs
      ?.filter((item) => item?.eventBlog !== null)
      ?.map((item) => ({
        id: item?.id,
        ...(item?.eventBlog as EventBlogWithDates)
      })) || [];

    blogs?.sort((a, b) => {
      const dateA = new Date(a?.event_date || 0).getTime();
      const dateB = new Date(b?.event_date || 0).getTime();
      return dateB - dateA;
    });

    res.status(200).json({ blogs });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching user event blogs:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateEventBlogDetails = async (req: Request, res: Response) => {
  try {
    const { blog_id: blogId } = req?.params || {};
    const data = req?.body || {};
    const updated = await updateEventBlog(blogId, data);
    if (!updated) {
      return res.status(404).json({ error: 'Event blog not found' });
    }
    res.status(204).json({});
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating event blog details:', message);
    res.status(httpCode).json({ error: message });
  }
};

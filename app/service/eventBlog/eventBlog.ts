import { Request, Response } from 'express';
import {
  getAllEventBlogs,
  getPublishedEventBlogs,
  getEventBlogsByAuthor,
  getEventBlogById,
  addEventBlog,
  updateEventBlog,
  deleteEventBlog
} from '../../api/eventBlog/eventBlog.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';
import logger from '../../utils/logger.js';

export const createEventBlog = async (req: Request, res: Response) => {
  try {
    const id = await addEventBlog({ ...req.body, author_id: res.locals?.uid ?? '' });
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating event blog:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getEventBlog = async (req: Request, res: Response) => {
  try {
    const { blog_id } = req.params;
    const blog = await getEventBlogById(blog_id);
    if (!blog) return res.status(404).json({ error: 'Event blog not found' });
    res.status(200).json({ blog });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching event blog:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllEventBlogsHandler = async (req: Request, res: Response) => {
  try {
    const blogs = await getAllEventBlogs();
    res.status(200).json({ blogs });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all event blogs:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getPublishedEventBlogsHandler = async (req: Request, res: Response) => {
  try {
    const blogs = await getPublishedEventBlogs();
    res.status(200).json({ blogs });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching published event blogs:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getMyEventBlogsHandler = async (req: Request, res: Response) => {
  try {
    const blogs = await getEventBlogsByAuthor(res.locals?.uid ?? '');
    res.status(200).json({ blogs });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching user event blogs:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateEventBlogHandler = async (req: Request, res: Response) => {
  try {
    const { blog_id } = req.params;
    const updated = await updateEventBlog(blog_id, req.body);
    if (!updated) return res.status(404).json({ error: 'Event blog not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating event blog:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteEventBlogHandler = async (req: Request, res: Response) => {
  try {
    const { blog_id } = req.params;
    const deleted = await deleteEventBlog(blog_id);
    if (!deleted) return res.status(404).json({ error: 'Event blog not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting event blog:', message);
    res.status(httpCode).json({ error: message });
  }
};

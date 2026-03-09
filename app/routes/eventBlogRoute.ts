import { Router } from 'express';
import {
  createEventBlog,
  getEventBlog,
  getAllEventBlogsHandler,
  getPublishedEventBlogsHandler,
  getMyEventBlogsHandler,
  updateEventBlogHandler,
  deleteEventBlogHandler
} from '../service/eventBlog/eventBlog.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { createEventBlogSchema, updateEventBlogSchema } from '../zod/eventBlogSchema.js';

const eventBlogRouter = Router();

// Public route — no auth required
eventBlogRouter.get('/public', (req, res) => getPublishedEventBlogsHandler(req, res));

eventBlogRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin', 'teacher'] }),
  validateBody(createEventBlogSchema),
  (req, res) => createEventBlog(req, res)
);

eventBlogRouter.get(
  '/all',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => getAllEventBlogsHandler(req, res)
);

eventBlogRouter.get(
  '/my-blogs',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin', 'teacher'] }),
  (req, res) => getMyEventBlogsHandler(req, res)
);

eventBlogRouter.get('/:blog_id', isAuthenticated, (req, res) => getEventBlog(req, res));

eventBlogRouter.put(
  '/:blog_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin', 'teacher'] }),
  validateBody(updateEventBlogSchema),
  (req, res) => updateEventBlogHandler(req, res)
);

eventBlogRouter.delete(
  '/:blog_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin', 'teacher'] }),
  (req, res) => deleteEventBlogHandler(req, res)
);

export default eventBlogRouter;

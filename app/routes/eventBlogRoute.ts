import { Router } from 'express';
import {
  createEventBlog,
  deleteEventBlogDetails,
  getAllEventBlogsHandler,
  getPublishedEventBlogsHandler,
  getMyEventBlogsHandler,
  searchEventBlog,
  updateEventBlogDetails
} from '../service/eventBlog/eventBlog.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';
import { validateBody } from '../middlewares/validateRequest.js';
import {
  createEventBlogSchema,
  updateEventBlogSchema
} from '../zod/eventBlogSchema.js';

const eventBlogRouter = Router();

eventBlogRouter.get('/public', (req, res) => {
  getPublishedEventBlogsHandler(req, res);
});

eventBlogRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin', 'teacher'] }),
  validateBody(createEventBlogSchema),
  (req, res) => {
    createEventBlog(req, res);
  }
);

eventBlogRouter.get('/search/:blog_id', isAuthenticated, (req, res) => {
  searchEventBlog(req, res);
});

eventBlogRouter.delete(
  '/delete/:blog_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin', 'teacher'] }),
  (req, res) => {
    deleteEventBlogDetails(req, res);
  }
);

eventBlogRouter.get(
  '/all',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => {
    getAllEventBlogsHandler(req, res);
  }
);

eventBlogRouter.get(
  '/my-blogs',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin', 'teacher'] }),
  (req, res) => {
    getMyEventBlogsHandler(req, res);
  }
);

eventBlogRouter.put(
  '/update/:blog_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin', 'teacher'] }),
  validateBody(updateEventBlogSchema),
  (req, res) => {
    updateEventBlogDetails(req, res);
  }
);

export default eventBlogRouter;

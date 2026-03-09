import { Router } from 'express';
import {
  createCircular,
  getCircular,
  getAllCircularsHandler,
  updateCircularHandler,
  deleteCircularHandler
} from '../service/circular/circular.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { createCircularSchema, updateCircularSchema } from '../zod/circularSchema.js';

const circularRouter = Router();

circularRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(createCircularSchema),
  (req, res) => createCircular(req, res)
);

circularRouter.get('/all', isAuthenticated, (req, res) => getAllCircularsHandler(req, res));

circularRouter.get('/:circular_id', isAuthenticated, (req, res) => getCircular(req, res));

circularRouter.put(
  '/:circular_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(updateCircularSchema),
  (req, res) => updateCircularHandler(req, res)
);

circularRouter.delete(
  '/:circular_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => deleteCircularHandler(req, res)
);

export default circularRouter;

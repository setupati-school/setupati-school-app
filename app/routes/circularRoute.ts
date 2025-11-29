import { Router } from 'express';
import {
  createCircular,
  deleteCircularDetails,
  getAllCirculars,
  searchCircular,
  updateCircularDetails
} from '../service/circular/circular.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';

const circularRouter = Router();

// Admin only - Create circular
circularRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  createCircular
);

// Public - Search circular
circularRouter.get('/search/:circular_id', searchCircular);

// Admin only - Delete circular
circularRouter.delete(
  '/delete/:circular_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  deleteCircularDetails
);

// Public - Get all circulars
circularRouter.get('/all', getAllCirculars);

// Admin only - Update circular
circularRouter.put(
  '/update/:circular_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  updateCircularDetails
);

export default circularRouter;

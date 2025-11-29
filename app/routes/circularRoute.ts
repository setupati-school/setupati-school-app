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

circularRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  createCircular
);

circularRouter.get('/search/:circular_id', searchCircular);

circularRouter.delete(
  '/delete/:circular_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  deleteCircularDetails
);

circularRouter.get('/all', getAllCirculars);

circularRouter.put(
  '/update/:circular_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  updateCircularDetails
);

export default circularRouter;

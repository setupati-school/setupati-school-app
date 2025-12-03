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
import { validateBody } from '../middlewares/validateRequest.js';
import {
  createCircularSchema,
  updateCircularSchema
} from '../zod/circularSchema.js';

const circularRouter = Router();

circularRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(createCircularSchema),
  (req,res) => {
  createCircular(req,res);
  }
);

circularRouter.get('/search/:circular_id', isAuthenticated, (req, res) => {
  searchCircular(req, res);
});

circularRouter.delete(
  '/delete/:circular_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => {
  deleteCircularDetails(req, res);
  } 
);

circularRouter.get('/all', isAuthenticated, (req, res) => {
  getAllCirculars(req, res);
});

circularRouter.put(
  '/update/:circular_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(updateCircularSchema),
  (req, res) => {
    updateCircularDetails(req, res);
  } 
);

export default circularRouter;

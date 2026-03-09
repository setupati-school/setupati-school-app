import { Router } from 'express';
import {
  createParent,
  getParent,
  getAllParentsHandler,
  updateParentHandler,
  deleteParentHandler
} from '../service/parent/parent.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';

const parentRouter = Router();

parentRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => createParent(req, res)
);

parentRouter.get('/all', isAuthenticated, isAuthorized({ hasRole: ['admin'] }), (req, res) =>
  getAllParentsHandler(req, res)
);

parentRouter.get('/:parent_id', isAuthenticated, (req, res) => getParent(req, res));

parentRouter.put(
  '/:parent_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => updateParentHandler(req, res)
);

parentRouter.delete(
  '/:parent_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => deleteParentHandler(req, res)
);

export default parentRouter;

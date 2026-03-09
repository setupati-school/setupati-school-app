import { Router } from 'express';
import {
  createTimetable,
  getTimetable,
  getAllTimetablesHandler,
  getTimetableBySectionHandler,
  updateTimetableHandler,
  deleteTimetableHandler
} from '../service/timetable/timetable.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { createTimetableSchema, updateTimetableSchema } from '../zod/timetableSchema.js';

const timetableRouter = Router();

timetableRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(createTimetableSchema),
  (req, res) => createTimetable(req, res)
);

timetableRouter.get('/all', isAuthenticated, (req, res) => getAllTimetablesHandler(req, res));

timetableRouter.get(
  '/section/:section_id',
  isAuthenticated,
  (req, res) => getTimetableBySectionHandler(req, res)
);

timetableRouter.get('/:timetable_id', isAuthenticated, (req, res) => getTimetable(req, res));

timetableRouter.put(
  '/:timetable_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(updateTimetableSchema),
  (req, res) => updateTimetableHandler(req, res)
);

timetableRouter.delete(
  '/:timetable_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => deleteTimetableHandler(req, res)
);

export default timetableRouter;

import { Router } from 'express';
import {
  createExamTimetable,
  getExamTimetable,
  getAllExamTimetablesHandler,
  getExamTimetablesByGradeHandler,
  updateExamTimetableHandler,
  deleteExamTimetableHandler
} from '../service/examtimetable/examtimetable.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { createExamTimetableSchema, updateExamTimetableSchema } from '../zod/examTimetableSchema.js';

const examTimetableRouter = Router();

examTimetableRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(createExamTimetableSchema),
  (req, res) => createExamTimetable(req, res)
);

examTimetableRouter.get('/all', isAuthenticated, (req, res) => getAllExamTimetablesHandler(req, res));

examTimetableRouter.get(
  '/grade/:grade_id',
  isAuthenticated,
  (req, res) => getExamTimetablesByGradeHandler(req, res)
);

examTimetableRouter.get(
  '/:exam_timetable_id',
  isAuthenticated,
  (req, res) => getExamTimetable(req, res)
);

examTimetableRouter.put(
  '/:exam_timetable_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(updateExamTimetableSchema),
  (req, res) => updateExamTimetableHandler(req, res)
);

examTimetableRouter.delete(
  '/:exam_timetable_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => deleteExamTimetableHandler(req, res)
);

export default examTimetableRouter;

import { Router } from 'express';
import {
  createExamResult,
  getExamResult,
  getAllExamResultsHandler,
  getExamResultsByStudentHandler,
  getExamResultsByExamHandler,
  updateExamResultHandler,
  deleteExamResultHandler
} from '../service/examresult/examresult.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { createExamResultSchema, updateExamResultSchema } from '../zod/examResultSchema.js';

const examResultRouter = Router();

examResultRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(createExamResultSchema),
  (req, res) => createExamResult(req, res)
);

examResultRouter.get('/all', isAuthenticated, (req, res) => getAllExamResultsHandler(req, res));

examResultRouter.get(
  '/student/:student_id',
  isAuthenticated,
  (req, res) => getExamResultsByStudentHandler(req, res)
);

examResultRouter.get(
  '/exam/:exam_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => getExamResultsByExamHandler(req, res)
);

examResultRouter.get('/:exam_result_id', isAuthenticated, (req, res) => getExamResult(req, res));

examResultRouter.put(
  '/:exam_result_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(updateExamResultSchema),
  (req, res) => updateExamResultHandler(req, res)
);

examResultRouter.delete(
  '/:exam_result_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => deleteExamResultHandler(req, res)
);

export default examResultRouter;

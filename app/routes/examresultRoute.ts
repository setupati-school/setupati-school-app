import { Router, Request, Response } from 'express';
import type examResult from '@setupati-school/setupati-types/models';
import {
  createExamResult,
  searchExamResult,
  updateExamResultDetails,
  getAllExamResultsDetails,
  deleteExamResultDetails,
  searchExamResultsByStudentId
} from '../service/examresult/examresult.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';
import { validateBody } from '../middlewares/validateRequest.js';
import {
  createExamResultSchema,
  updateExamResultSchema
} from '../zod/examResultSchema.js';

const examResultRouter = Router();

examResultRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(createExamResultSchema),
  (req: Request, res: Response) => {
    createExamResult(req, res);
  }
);

examResultRouter.get(
  '/search/:exam_result_id',
  isAuthenticated,
  (req: Request, res: Response) => {
    searchExamResult(req, res);
  }
);

examResultRouter.delete(
  '/delete/:exam_result_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req: Request, res: Response) => {
    deleteExamResultDetails(req, res);
  }
);

examResultRouter.get('/all', isAuthenticated, (req: Request, res: Response) => {
  return getAllExamResultsDetails(req, res);
});

examResultRouter.get(
  '/student/:student_id',
  isAuthenticated,
  (req: Request, res: Response) => {
    searchExamResultsByStudentId(req, res);
  }
);

examResultRouter.put(
  '/update/:exam_result_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(updateExamResultSchema),
  (
    req: Request,
    res: Response
  ) => {
    updateExamResultDetails(req, res);
  }
);

export default examResultRouter;

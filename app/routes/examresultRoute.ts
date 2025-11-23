import { Router, Request, Response } from 'express';
import type examResult from '@setupati-school/setupati-types/models';
import {
  createExamResult,
  searchExamResult,
  updateExamResultDetails,
  getAllExamResultsDetails,
  deleteExamResultDetails
} from '../service/examresult/examresult.js';
type ExamResult = typeof examResult;

const examResultRouter = Router();

examResultRouter.post(
  '/create',
  (req: Request<{ ExamResult: ExamResult }>, res: Response) => {
    createExamResult(req, res);
  }
);

examResultRouter.get(
  '/search/:exam_result_id',
  (req: Request<{ exam_result_id: string }>, res: Response) => {
    searchExamResult(req, res);
  }
);

examResultRouter.delete(
  '/delete/:exam_result_id',
  (req: Request<{ exam_result_id: string }>, res: Response) => {
    deleteExamResultDetails(req, res);
  }
);

examResultRouter.get('/all', (req: Request, res: Response) => {
  return getAllExamResultsDetails(req, res);
});

examResultRouter.put(
  '/update/:exam_result_id',
  (
    req: Request<{ exam_result_id: string; ExamResult: Partial<ExamResult> }>,
    res: Response
  ) => {
    updateExamResultDetails(req, res);
  }
);

export default examResultRouter;

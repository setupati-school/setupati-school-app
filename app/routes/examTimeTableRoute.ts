import { Router, Request, Response } from 'express';
import type examTimeTable from '@setupati-school/setupati-types/models';
import {
  createExamTimeTable,
  searchExamTimeTable,
  deleteExamTimeTableDetails,
  getAllExamTimeTablesDetails,
  updateExamTimeTableDetails
} from '../service/examtimetable/examtimetable.js';
type ExamTimeTable = typeof examTimeTable;

const examTimeTableRouter = Router();

examTimeTableRouter.post(
  '/create',
  (req: Request<{ ExamTimeTable: ExamTimeTable }>, res: Response) => {
    createExamTimeTable(req, res);
  }
);

examTimeTableRouter.get(
  '/search/:exam_time_table_id',
  (req: Request<{ exam_time_table_id: string }>, res: Response) => {
    searchExamTimeTable(req, res);
  }
);

examTimeTableRouter.delete(
  '/delete/:exam_time_table_id',
  (req: Request<{ exam_time_table_id: string }>, res: Response) => {
    deleteExamTimeTableDetails(req, res);
  }
);

examTimeTableRouter.get('/all', (req: Request, res: Response) => {
  return getAllExamTimeTablesDetails(req, res);
});

examTimeTableRouter.put(
  '/update/:exam_time_table_id',
  (
    req: Request<{
      exam_time_table_id: string;
      ExamTimeTable: Partial<ExamTimeTable>;
    }>,
    res: Response
  ) => {
    updateExamTimeTableDetails(req, res);
  }
);

export default examTimeTableRouter;

import { Router, Request, Response } from 'express';
import type grade from '@setupati-school/setupati-types/models';
import {
  createGrade,
  deleteGradeDetails,
  getAllGrades,
  searchGrade,
  updateGradeDetails
} from '../service/grade/grade.js';

type Grade = typeof grade;

const gradeRouter = Router();

gradeRouter.post('/create', (req: Request<{ Grade: Grade }>, res: Response) => {
  createGrade(req, res);
});
gradeRouter.get(
  '/search/:grade_id',
  (req: Request<{ grade_id: string }>, res: Response) => {
    searchGrade(req, res);
  }
);

gradeRouter.delete(
  '/delete/:grade_id',
  (req: Request<{ grade_id: string }>, res: Response) => {
    deleteGradeDetails(req, res);
  }
);

gradeRouter.get('/all', (req: Request, res: Response) => {
  return getAllGrades(req, res);
});

gradeRouter.put(
  '/update/:grade_id',
  (
    req: Request<{ grade_id: string; Grade: Partial<Grade> }>,
    res: Response
  ) => {
    updateGradeDetails(req, res);
  }
);

export default gradeRouter;

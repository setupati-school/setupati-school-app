import {
  createSubject,
  searchSubject,
  deleteSubjectDetails,
  getAllSubjects,
  updateSubjectDetails
} from '../service/subject/subject.js';
import { Router, Request, Response } from 'express';
import type subject from '@setupati-school/setupati-types/models';
type Subject = typeof subject;

const subjectRouter = Router();

subjectRouter.post(
  '/create',
  (req: Request<{ Subject: Subject }>, res: Response) => {
    createSubject(req, res);
  }
);

subjectRouter.get(
  '/search/:subject_id',
  (req: Request<{ subject_id: string }>, res: Response) => {
    searchSubject(req, res);
  }
);

subjectRouter.delete(
  '/delete/:subject_id',
  (req: Request<{ subject_id: string }>, res: Response) => {
    deleteSubjectDetails(req, res);
  }
);

subjectRouter.get('/all', (req: Request, res: Response) => {
  return getAllSubjects(req, res);
});

subjectRouter.put(
  '/update/:subject_id',
  (
    req: Request<{ subject_id: string; Subject: Partial<Subject> }>,
    res: Response
  ) => {
    updateSubjectDetails(req, res);
  }
);

export default subjectRouter;

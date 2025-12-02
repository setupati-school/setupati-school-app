import { Router } from 'express';
import {
  createSubject,
  searchSubject,
  deleteSubjectDetails,
  getAllSubjects,
  updateSubjectDetails
} from '../service/subject/subject.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';
import { validateBody } from '../middlewares/validateRequest.js';
import {
  createSubjectSchema,
  updateSubjectSchema
} from '../zod/subjectSchema.js';

const subjectRouter = Router();

subjectRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(createSubjectSchema),
  createSubject
);

subjectRouter.get('/search/:subject_id', searchSubject);

subjectRouter.delete(
  '/delete/:subject_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  deleteSubjectDetails
);

subjectRouter.get('/all', getAllSubjects);

subjectRouter.put(
  '/update/:subject_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(updateSubjectSchema),
  updateSubjectDetails
);

export default subjectRouter;

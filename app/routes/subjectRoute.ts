import { Router } from 'express';
import {
  createSubject,
  getSubject,
  getAllSubjectsHandler,
  updateSubjectHandler,
  deleteSubjectHandler
} from '../service/subject/subject.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { createSubjectSchema, updateSubjectSchema } from '../zod/subjectSchema.js';

const subjectRouter = Router();

subjectRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(createSubjectSchema),
  (req, res) => createSubject(req, res)
);

subjectRouter.get('/all', isAuthenticated, (req, res) => getAllSubjectsHandler(req, res));

subjectRouter.get('/:subject_id', isAuthenticated, (req, res) => getSubject(req, res));

subjectRouter.put(
  '/:subject_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(updateSubjectSchema),
  (req, res) => updateSubjectHandler(req, res)
);

subjectRouter.delete(
  '/:subject_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => deleteSubjectHandler(req, res)
);

export default subjectRouter;

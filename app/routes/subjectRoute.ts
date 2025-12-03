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
  (req,res) => {
  createSubject(req, res);
  } 
);

subjectRouter.get('/search/:subject_id', isAuthenticated, (req, res) => {
  searchSubject(req, res);
} );

subjectRouter.delete(
  '/delete/:subject_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => {
  deleteSubjectDetails(req, res);
  } 
);

subjectRouter.get('/all', isAuthenticated, (req, res) => {
  getAllSubjects(req, res);
});

subjectRouter.put(
  '/update/:subject_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(updateSubjectSchema),
  (req, res) => {
  updateSubjectDetails(req, res);
  } 
);

export default subjectRouter;

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

const subjectRouter = Router();

// Admin only - Create subject
subjectRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  createSubject
);

// Public - Search subject
subjectRouter.get('/search/:subject_id', searchSubject);

// Admin only - Delete subject
subjectRouter.delete(
  '/delete/:subject_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  deleteSubjectDetails
);

// Public - Get all subjects
subjectRouter.get('/all', getAllSubjects);

// Admin only - Update subject
subjectRouter.put(
  '/update/:subject_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  updateSubjectDetails
);

export default subjectRouter;

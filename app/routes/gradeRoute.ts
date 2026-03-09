import { Router } from 'express';
import {
  createGrade,
  getGrade,
  getAllGradesHandler,
  updateGradeHandler,
  deleteGradeHandler
} from '../service/grade/grade.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';

const gradeRouter = Router();

gradeRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => createGrade(req, res)
);

gradeRouter.get('/all', isAuthenticated, (req, res) => getAllGradesHandler(req, res));

gradeRouter.get('/:grade_id', isAuthenticated, (req, res) => getGrade(req, res));

gradeRouter.put(
  '/:grade_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => updateGradeHandler(req, res)
);

gradeRouter.delete(
  '/:grade_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => deleteGradeHandler(req, res)
);

export default gradeRouter;

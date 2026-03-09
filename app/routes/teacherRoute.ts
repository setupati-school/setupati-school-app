import { Router } from 'express';
import {
  createTeacher,
  getTeacher,
  getAllTeachersHandler,
  updateTeacherHandler,
  deleteTeacherHandler
} from '../service/teacher/teacher.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';

const teacherRouter = Router();

teacherRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => createTeacher(req, res)
);

teacherRouter.get('/all', isAuthenticated, (req, res) => getAllTeachersHandler(req, res));

teacherRouter.get('/:teacher_id', isAuthenticated, (req, res) => getTeacher(req, res));

teacherRouter.put(
  '/:teacher_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => updateTeacherHandler(req, res)
);

teacherRouter.delete(
  '/:teacher_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => deleteTeacherHandler(req, res)
);

export default teacherRouter;

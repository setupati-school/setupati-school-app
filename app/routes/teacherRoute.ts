import {
  createTeacher,
  searchTeacher,
  deleteTeacherDetails,
  getAllTeachers,
  updateTeacherDetails
} from '../service/teacher/teacher.js';
import { Router } from 'express';
import { updateCircularSchema } from '../zod/circularSchema.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';

const teacherRouter = Router();

teacherRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(updateCircularSchema),
  (req, res) => {
    createTeacher(req, res);
  }
);

teacherRouter.get(
  '/search/:teacher_id',
  isAuthenticated,
  (req, res) => {
    searchTeacher(req, res);
  }
);

teacherRouter.delete(
  '/delete/:teacher_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => {
    deleteTeacherDetails(req, res);
  }
);

teacherRouter.get('/all', 
  isAuthenticated,
  (req, res) => {
  return getAllTeachers(req, res);
});

teacherRouter.put(
  '/update/:teacher_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(updateCircularSchema),
  (req,res)=> {
    updateTeacherDetails(req, res);
  }
);

export default teacherRouter;

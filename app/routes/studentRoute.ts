import { Router } from 'express';
import {
  createStudent,
  getStudent,
  getAllStudentsHandler,
  searchStudentByRollNo,
  updateStudentHandler,
  deleteStudentHandler
} from '../service/student/student.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';

const studentRouter = Router();

studentRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => createStudent(req, res)
);

studentRouter.get('/all', isAuthenticated, (req, res) => getAllStudentsHandler(req, res));

studentRouter.get(
  '/search/:roll_no',
  isAuthenticated,
  (req, res) => searchStudentByRollNo(req, res)
);

studentRouter.get(
  '/:student_id',
  isAuthenticated,
  (req, res) => getStudent(req, res)
);

studentRouter.put(
  '/:student_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => updateStudentHandler(req, res)
);

studentRouter.delete(
  '/:student_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => deleteStudentHandler(req, res)
);

export default studentRouter;

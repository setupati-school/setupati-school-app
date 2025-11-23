import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getUserById,
  validateEmail,
  createStudentAndParent,
  createTeacher
} from '../service/auth/auth.js';
import {
  studentSchema,
  teacherSchema,
  getUserSchema,
  validateEmailSchema,
  deleteUserSchema
} from '../zod/authSchema.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';
import {
  validateBody,
  validateParams
} from '../middlewares/validateRequest.js';

const authRouter = Router();

authRouter.post(
  '/signup/create-student',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(studentSchema),
  (req, res) => {
    createStudentAndParent(req, res);
  }
);

authRouter.post(
  '/signup/create-teacher',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(teacherSchema),
  (req, res) => {
    createTeacher(req, res);
  }
);

authRouter.post(
  '/signup',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => {
    createUser(req, res);
  }
);

authRouter.get(
  '/users/:uid',
  isAuthenticated,
  isAuthorized({
    hasRole: ['admin', 'student', 'teacher'],
    allowSameUser: true
  }),
  validateParams(getUserSchema),
  (req, res) => {
    getUserById(req, res);
  }
);

authRouter.post(
  '/validateEmail',
  validateBody(validateEmailSchema),
  (req, res) => {
    validateEmail(req, res);
  }
);

authRouter.delete(
  '/delete/:uid',
  isAuthenticated,
  isAuthorized({
    hasRole: ['admin']
  }),
  validateParams(deleteUserSchema),
  (req, res) => {
    deleteUser(req, res);
  }
);

export default authRouter;

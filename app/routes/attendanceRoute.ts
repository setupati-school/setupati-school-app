import { Router } from 'express';
import {
  createAttendance,
  getAttendanceHandler,
  getAllAttendanceHandler,
  getAttendanceByStudentHandler,
  getAttendanceBySectionHandler,
  updateAttendanceHandler,
  deleteAttendanceHandler
} from '../service/attendance/attendance.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { createAttendanceSchema, updateAttendanceSchema } from '../zod/attendanceSchema.js';

const attendanceRouter = Router();

attendanceRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin', 'teacher'] }),
  validateBody(createAttendanceSchema),
  (req, res) => createAttendance(req, res)
);

attendanceRouter.get('/all', isAuthenticated, (req, res) => getAllAttendanceHandler(req, res));

attendanceRouter.get(
  '/student/:student_id',
  isAuthenticated,
  (req, res) => getAttendanceByStudentHandler(req, res)
);

attendanceRouter.get(
  '/section/:section_id',
  isAuthenticated,
  (req, res) => getAttendanceBySectionHandler(req, res)
);

attendanceRouter.get('/:attendance_id', isAuthenticated, (req, res) => getAttendanceHandler(req, res));

attendanceRouter.put(
  '/:attendance_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin', 'teacher'] }),
  validateBody(updateAttendanceSchema),
  (req, res) => updateAttendanceHandler(req, res)
);

attendanceRouter.delete(
  '/:attendance_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => deleteAttendanceHandler(req, res)
);

export default attendanceRouter;

import { Router, Request, Response } from 'express';
import type attendance from '@setupati-school/setupati-types/models';
import {
  createAttendance,
  deleteAttendanceDetails,
  getAllAttendance,
  searchAttendance,
  updateAttendanceDetails
} from '../service/attendance/attendance.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';
import { validateBody } from '../middlewares/validateRequest.js';
import { createAttendanceSchema, updateAttendanceSchema } from '../zod/attendanceSchema.js';

type Attendance = typeof attendance;

const attendanceRouter = Router();

attendanceRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(createAttendanceSchema),
  (req: Request<{ Attendance: Attendance }>, res: Response) => {
    createAttendance(req, res);
  }
);

attendanceRouter.get(
  '/search/:attendance_id',
  isAuthenticated,
  (req: Request<{ attendance_id: string }>, res: Response) => {
    searchAttendance(req, res);
  }
);

attendanceRouter.delete(
  '/delete/:attendance_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req: Request<{ attendance_id: string }>, res: Response) => {
    deleteAttendanceDetails(req, res);
  }
);

attendanceRouter.get('/all', isAuthenticated, (req: Request, res: Response) => {
  return getAllAttendance(req, res);
});

attendanceRouter.put(
  '/update/:attendance_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(updateAttendanceSchema),
  (
    req: Request<{ attendance_id: string; Attendance: Partial<Attendance> }>,
    res: Response
  ) => {
    updateAttendanceDetails(req, res);
  }
);

export default attendanceRouter;

import { Router, Request, Response } from 'express';
import type attendance from '@setupati-school/setupati-types/models';
import {
  createAttendance,
  deleteAttendanceDetails,
  getAllAttendance,
  searchAttendance,
  updateAttendanceDetails
} from '../service/attendance/attendance.js';
type Attendance = typeof attendance;

const attendanceRouter = Router();

attendanceRouter.post(
  '/create',
  (req: Request<{ Attendance: Attendance }>, res: Response) => {
    createAttendance(req, res);
  }
);

attendanceRouter.get(
  '/search/:attendance_id',
  (req: Request<{ attendance_id: string }>, res: Response) => {
    searchAttendance(req, res);
  }
);

attendanceRouter.delete(
  '/delete/:attendance_id',
  (req: Request<{ attendance_id: string }>, res: Response) => {
    deleteAttendanceDetails(req, res);
  }
);

attendanceRouter.get('/all', (req: Request, res: Response) => {
  return getAllAttendance(req, res);
});

attendanceRouter.put(
  '/update/:attendance_id',
  (
    req: Request<{ attendance_id: string; Attendance: Partial<Attendance> }>,
    res: Response
  ) => {
    updateAttendanceDetails(req, res);
  }
);

export default attendanceRouter;

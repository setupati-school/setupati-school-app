import { Request, Response } from 'express';
import type attendance from '@setupati-school/setupati-types/models';
import logger from '../../utils/logger.js';
import {
  addAttendance,
  deleteAttendance,
  getAllAttendanceDetails,
  updateAttendance,
  searchAttendance as searchAttendanceApi
} from '../../api/attendance/attendance.js';
type Attendance = typeof attendance;

export const createAttendance = async (
  req: Request<{ Attendance: Attendance }>,
  res: Response
) => {
  try {
    const { body: data } = req ?? {};
    const id = await addAttendance(data);
    res.status(201).json({ id });
  } catch (error) {
    logger.error('Error creating attendance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const searchAttendance = async (
  req: Request<{ attendance_id: string }>,
  res: Response
) => {
  try {
    const { attendance_id: attendanceId } = req.params;
    if (!attendanceId) {
      return res.status(400).json({ error: 'Attendance ID is required' });
    }
    const attendance = await searchAttendanceApi(attendanceId);
    res.status(200).json(attendance);
  } catch (error) {
    logger.error('Error searching for attendance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteAttendanceDetails = async (
  req: Request<{ attendance_id: string }>,
  res: Response
): Promise<Response | void> => {
  try {
    const { attendance_id: attendanceId } = req.params;
    if (!attendanceId) {
      return res.status(400).json({ error: 'Attendance ID is required' });
    }
    const deleted = await deleteAttendance(attendanceId);
    logger.info('deleted attendance data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Attendance not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error deleting attendance details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllAttendance = async (req: Request, res: Response) => {
  try {
    const attendance = await getAllAttendanceDetails();
    res.status(200).json(attendance);
  } catch (error) {
    logger.error('Error fetching all attendance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateAttendanceDetails = async (
  req: Request<{ attendance_id: string; Attendance: Partial<Attendance> }>,
  res: Response
) => {
  try {
    const { attendance_id: attendanceId } = req.params;
    if (!attendanceId) {
      return res.status(400).json({ error: 'Attendance ID is required' });
    }
    const data = req?.body;
    const updated = await updateAttendance(attendanceId, data);
    if (!updated) {
      return res.status(404).json({ error: 'Attendance not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error updating attendance details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

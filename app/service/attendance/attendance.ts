import { Request, Response } from 'express';
import {
  getAllAttendance,
  getAttendanceById,
  getAttendanceByStudent,
  getAttendanceBySection,
  addAttendance,
  updateAttendance,
  deleteAttendance
} from '../../api/attendance/attendance.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';
import logger from '../../utils/logger.js';

export const createAttendance = async (req: Request, res: Response) => {
  try {
    const id = await addAttendance(req.body);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating attendance:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAttendanceHandler = async (req: Request, res: Response) => {
  try {
    const { attendance_id } = req.params;
    const record = await getAttendanceById(attendance_id);
    if (!record) return res.status(404).json({ error: 'Attendance record not found' });
    res.status(200).json({ attendance: record });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching attendance:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllAttendanceHandler = async (req: Request, res: Response) => {
  try {
    const attendance = await getAllAttendance();
    res.status(200).json({ attendance });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all attendance:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAttendanceByStudentHandler = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;
    const attendance = await getAttendanceByStudent(student_id);
    res.status(200).json({ attendance });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching student attendance:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAttendanceBySectionHandler = async (req: Request, res: Response) => {
  try {
    const { section_id } = req.params;
    const { date } = req.query as { date?: string };
    const attendance = await getAttendanceBySection(section_id, date);
    res.status(200).json({ attendance });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching section attendance:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateAttendanceHandler = async (req: Request, res: Response) => {
  try {
    const { attendance_id } = req.params;
    const updated = await updateAttendance(attendance_id, req.body);
    if (!updated) return res.status(404).json({ error: 'Attendance record not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating attendance:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteAttendanceHandler = async (req: Request, res: Response) => {
  try {
    const { attendance_id } = req.params;
    const deleted = await deleteAttendance(attendance_id);
    if (!deleted) return res.status(404).json({ error: 'Attendance record not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting attendance:', message);
    res.status(httpCode).json({ error: message });
  }
};

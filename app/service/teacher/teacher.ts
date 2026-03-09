import { Request, Response } from 'express';
import {
  getAllTeachers,
  getTeacherById,
  addTeacher,
  updateTeacher,
  deleteTeacher
} from '../../api/teacher/teacher.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';
import logger from '../../utils/logger.js';

export const createTeacher = async (req: Request, res: Response) => {
  try {
    const id = await addTeacher(req.body);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating teacher:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getTeacher = async (req: Request, res: Response) => {
  try {
    const { teacher_id } = req.params;
    const teacher = await getTeacherById(teacher_id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.status(200).json({ teacher });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching teacher:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllTeachersHandler = async (req: Request, res: Response) => {
  try {
    const teachers = await getAllTeachers();
    res.status(200).json({ teachers });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all teachers:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateTeacherHandler = async (req: Request, res: Response) => {
  try {
    const { teacher_id } = req.params;
    const updated = await updateTeacher(teacher_id, req.body);
    if (!updated) return res.status(404).json({ error: 'Teacher not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating teacher:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteTeacherHandler = async (req: Request, res: Response) => {
  try {
    const { teacher_id } = req.params;
    const deleted = await deleteTeacher(teacher_id);
    if (!deleted) return res.status(404).json({ error: 'Teacher not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting teacher:', message);
    res.status(httpCode).json({ error: message });
  }
};

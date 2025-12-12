import { Request, Response } from 'express';
import {
  addTeacher,
  deleteTeacher,
  getAllTeacherDetails,
  searchTeacher as searchTeacherApi,
  updateTeacher
} from '../../api/teacher/teacher.js';
import logger from '../../utils/logger.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';

export const createTeacher = async (
  req: Request,
  res: Response
) => {
  try {
    const { body: data } = req ?? {};
    const id = await addTeacher(data);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating teacher:', message);
    res.status(httpCode || 500).json({ error: message || 'Internal Server Error' });
  }
};

export const searchTeacher = async (
  req: Request,
  res: Response
) => {
  try {
    const { teacher_id: teacherId } = req.params;
    const teachers = await searchTeacherApi(teacherId);
    res.status(200).json(teachers);
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error searching for teachers:', message);
    res.status(httpCode || 500).json({ error: message || 'Internal Server Error' });
  }
};

export const deleteTeacherDetails = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { teacher_id: teacherId } = req.params;
    const deleted = await deleteTeacher(teacherId);
    logger.info('deleted teacher data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.status(204).json({});
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting teacher details:', message);
    res.status(httpCode || 500).json({ error: message || 'Internal Server Error' });
  }
};

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await getAllTeacherDetails();
    res.status(200).json(teachers);
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all teachers:', message);
    res.status(httpCode || 500).json({ error: message || 'Internal Server Error' });
  }
};

export const updateTeacherDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const { teacher_id: teacherId } = req.params;
    const data = req?.body;
    const updated = await updateTeacher(teacherId, data);
    if (!updated) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.status(204).json({});
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating teacher details:', message);
    res.status(httpCode || 500).json({ error: message || 'Internal Server Error' });
  }
};

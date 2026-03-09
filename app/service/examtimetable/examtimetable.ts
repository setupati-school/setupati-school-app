import { Request, Response } from 'express';
import {
  getAllExamTimetables,
  getExamTimetableById,
  getExamTimetablesByGrade,
  addExamTimetable,
  updateExamTimetable,
  deleteExamTimetable
} from '../../api/examtimetable/examtimetable.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';
import logger from '../../utils/logger.js';

export const createExamTimetable = async (req: Request, res: Response) => {
  try {
    const id = await addExamTimetable(req.body);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating exam timetable:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getExamTimetable = async (req: Request, res: Response) => {
  try {
    const { exam_timetable_id } = req.params;
    const examTimetable = await getExamTimetableById(exam_timetable_id);
    if (!examTimetable) return res.status(404).json({ error: 'Exam timetable not found' });
    res.status(200).json({ examTimetable });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching exam timetable:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllExamTimetablesHandler = async (req: Request, res: Response) => {
  try {
    const examTimetables = await getAllExamTimetables();
    res.status(200).json({ examTimetables });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all exam timetables:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getExamTimetablesByGradeHandler = async (req: Request, res: Response) => {
  try {
    const { grade_id } = req.params;
    const examTimetables = await getExamTimetablesByGrade(grade_id);
    res.status(200).json({ examTimetables });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching grade exam timetables:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateExamTimetableHandler = async (req: Request, res: Response) => {
  try {
    const { exam_timetable_id } = req.params;
    const updated = await updateExamTimetable(exam_timetable_id, req.body);
    if (!updated) return res.status(404).json({ error: 'Exam timetable not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating exam timetable:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteExamTimetableHandler = async (req: Request, res: Response) => {
  try {
    const { exam_timetable_id } = req.params;
    const deleted = await deleteExamTimetable(exam_timetable_id);
    if (!deleted) return res.status(404).json({ error: 'Exam timetable not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting exam timetable:', message);
    res.status(httpCode).json({ error: message });
  }
};

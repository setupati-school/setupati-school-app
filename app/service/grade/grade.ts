import { Request, Response } from 'express';
import {
  getAllGrades,
  getGradeById,
  addGrade,
  updateGrade,
  deleteGrade
} from '../../api/grade/grade.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';
import logger from '../../utils/logger.js';

export const createGrade = async (req: Request, res: Response) => {
  try {
    const id = await addGrade(req.body);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating grade:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getGrade = async (req: Request, res: Response) => {
  try {
    const { grade_id } = req.params;
    const grade = await getGradeById(grade_id);
    if (!grade) return res.status(404).json({ error: 'Grade not found' });
    res.status(200).json({ grade });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching grade:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllGradesHandler = async (req: Request, res: Response) => {
  try {
    const grades = await getAllGrades();
    res.status(200).json({ grades });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all grades:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateGradeHandler = async (req: Request, res: Response) => {
  try {
    const { grade_id } = req.params;
    const updated = await updateGrade(grade_id, req.body);
    if (!updated) return res.status(404).json({ error: 'Grade not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating grade:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteGradeHandler = async (req: Request, res: Response) => {
  try {
    const { grade_id } = req.params;
    const deleted = await deleteGrade(grade_id);
    if (!deleted) return res.status(404).json({ error: 'Grade not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting grade:', message);
    res.status(httpCode).json({ error: message });
  }
};

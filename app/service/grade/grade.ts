import { Request, Response } from 'express';
import type grade from '@setupati-school/setupati-types/models';
import logger from '../../utils/logger.js';
import {
  addGrade,
  deleteGrade,
  getAllGradeDetails,
  updateGrade,
  searchGrade as searchGradeApi
} from '../../api/grade/grade.js';
type Grade = typeof grade;

export const createGrade = async (
  req: Request<{ Grade: Grade }>,
  res: Response
) => {
  try {
    const { body: data } = req ?? {};
    const id = await addGrade(data);
    res.status(201).json({ id });
  } catch (error) {
    logger.error('Error creating grade:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const searchGrade = async (
  req: Request<{ grade_id: string }>,
  res: Response
) => {
  try {
    const { grade_id: gradeName } = req.params;
    if (!gradeName) {
      return res.status(400).json({ error: 'Grade ID is required' });
    }
    const grades = await searchGradeApi(gradeName);
    res.status(200).json(grades);
  } catch (error) {
    logger.error('Error searching for grades:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteGradeDetails = async (
  req: Request<{ grade_id: string }>,
  res: Response
): Promise<Response | void> => {
  try {
    const { grade_id: gradeName } = req.params;
    if (!gradeName) {
      return res.status(400).json({ error: 'Grade ID is required' });
    }
    const deleted = await deleteGrade(gradeName);
    logger.info('deleted grade data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Grade not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error deleting grade details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllGrades = async (req: Request, res: Response) => {
  try {
    const grades = await getAllGradeDetails();
    res.status(200).json(grades);
  } catch (error) {
    logger.error('Error fetching all grades:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateGradeDetails = async (
  req: Request<{ grade_id: string; Grade: Partial<Grade> }>,
  res: Response
) => {
  try {
    const { grade_id: gradeName } = req.params;
    if (!gradeName) {
      return res.status(400).json({ error: 'Grade ID is required' });
    }
    const data = req?.body;
    const updated = await updateGrade(gradeName, data);
    if (!updated) {
      return res.status(404).json({ error: 'Grade not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error updating grade details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

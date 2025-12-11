import { Request, Response } from 'express';
import type examTimeTable from '@setupati-school/setupati-types/models';
import logger from '../../utils/logger.js';
import {
  addExamTimeTable,
  deleteExamTimeTable,
  getAllExamTimeTables,
  updateExamTimeTable,
  searchExamTimeTable as searchExamTimeTableApi
} from '../../api/examtimetable/examtimetable.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';

export const createExamTimeTable = async (
  req: Request, res: Response
) => {
  try {
    const data = req?.body;
    const id = await addExamTimeTable(data);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating exam time table:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const searchExamTimeTable = async (
  req: Request,
  res: Response
) => {
  try {
    const { id: examTimeTableId } = req?.params || {};
    const examTimeTable = await searchExamTimeTableApi(examTimeTableId);
    res.status(200).json(examTimeTable);
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error searching for exam time table:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteExamTimeTableDetails = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { id: examTimeTableId } = req?.params || {};
    const deleted = await deleteExamTimeTable(examTimeTableId);
    logger.info('deleted exam time table data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Exam Time Table not found' });
    }
    res.status(204).json({});
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting exam time table:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllExamTimeTablesDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const examTimeTables = await getAllExamTimeTables();
    res.status(200).json(examTimeTables || []);
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all exam time tables:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateExamTimeTableDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const { id: examTimeTableId } = req?.params || {};
    if (!examTimeTableId) {
      return res.status(400).json({ error: 'Exam Time Table ID is required' });
    }
    const data = req?.body;
    const updated = await updateExamTimeTable(examTimeTableId, data);
    if (!updated) {
      return res.status(404).json({ error: 'Exam Time Table not found' });
    }
    res.status(204).json({});
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating exam time table:', message);
    res.status(httpCode).json({ error: message });
  }
};

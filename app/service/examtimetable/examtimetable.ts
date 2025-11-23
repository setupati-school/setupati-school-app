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
type ExamTimeTable = typeof examTimeTable;

export const createExamTimeTable = async (
  req: Request<{ ExamTimeTable: ExamTimeTable }>,
  res: Response
) => {
  try {
    const { body: data } = req ?? {};
    const id = await addExamTimeTable(data);
    res.status(201).json({ id });
  } catch (error) {
    logger.error('Error creating exam time table:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const searchExamTimeTable = async (
  req: Request<{ exam_time_table_id: string }>,
  res: Response
) => {
  try {
    const { exam_time_table_id: examTimeTableId } = req.params;
    if (!examTimeTableId) {
      return res.status(400).json({ error: 'Exam Time Table ID is required' });
    }
    const examTimeTable = await searchExamTimeTableApi(examTimeTableId);
    res.status(200).json(examTimeTable);
  } catch (error) {
    logger.error('Error searching for exam time table:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteExamTimeTableDetails = async (
  req: Request<{ exam_time_table_id: string }>,
  res: Response
): Promise<Response | void> => {
  try {
    const { exam_time_table_id: examTimeTableId } = req.params;
    if (!examTimeTableId) {
      return res.status(400).json({ error: 'Exam Time Table ID is required' });
    }
    const deleted = await deleteExamTimeTable(examTimeTableId);
    logger.info('deleted exam time table data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Exam Time Table not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error deleting exam time table:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllExamTimeTablesDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const examTimeTables = await getAllExamTimeTables();
    res.status(200).json(examTimeTables);
  } catch (error) {
    logger.error('Error fetching all exam time tables:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateExamTimeTableDetails = async (
  req: Request<{
    exam_time_table_id: string;
    ExamTimeTable: Partial<ExamTimeTable>;
  }>,
  res: Response
) => {
  try {
    const { exam_time_table_id: examTimeTableId } = req.params;
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
    logger.error('Error updating exam time table:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

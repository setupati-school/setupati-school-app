import { Request, Response } from 'express';
import type examResult from '@setupati-school/setupati-types/models';
import logger from '../../utils/logger.js';
import {
  addExamResult,
  deleteExamResult,
  getAllExamResults,
  updateExamResult,
  searchExamResult as searchExamResultApi
} from '../../api/examresult/examresult.js';
type ExamResult = typeof examResult;

export const createExamResult = async (
  req: Request<{ ExamResult: ExamResult }>,
  res: Response
) => {
  try {
    const { body: data } = req ?? {};
    const id = await addExamResult(data);
    res.status(201).json({ id });
  } catch (error) {
    logger.error('Error creating exam result:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const searchExamResult = async (
  req: Request<{ exam_result_id: string }>,
  res: Response
) => {
  try {
    const { exam_result_id: examResultId } = req.params;
    if (!examResultId) {
      return res.status(400).json({ error: 'Exam Result ID is required' });
    }
    const examResult = await searchExamResultApi(examResultId);
    res.status(200).json(examResult);
  } catch (error) {
    logger.error('Error searching for exam result:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteExamResultDetails = async (
  req: Request<{ exam_result_id: string }>,
  res: Response
): Promise<Response | void> => {
  try {
    const { exam_result_id: examResultId } = req.params;
    if (!examResultId) {
      return res.status(400).json({ error: 'Exam Result ID is required' });
    }
    const deleted = await deleteExamResult(examResultId);
    logger.info('deleted exam result data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Exam Result not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error deleting exam result:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllExamResultsDetails = async (req: Request, res: Response) => {
  try {
    const examResults = await getAllExamResults();
    res.status(200).json(examResults);
  } catch (error) {
    logger.error('Error fetching all exam results:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateExamResultDetails = async (
  req: Request<{ exam_result_id: string; ExamResult: Partial<ExamResult> }>,
  res: Response
) => {
  try {
    const { exam_result_id: examResultId } = req.params;
    if (!examResultId) {
      return res.status(400).json({ error: 'Exam Result ID is required' });
    }
    const data = req?.body;
    const updated = await updateExamResult(examResultId, data);
    if (!updated) {
      return res.status(404).json({ error: 'Exam Result not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error updating exam result:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

import { Request, Response } from 'express';
import type examResult from '@setupati-school/setupati-types/models';
import logger from '../../utils/logger.js';
import {
  addExamResult,
  deleteExamResult,
  getAllExamResults,
  updateExamResult,
  searchExamResult as searchExamResultApi,
  getExamResultsByStudentId
} from '../../api/examresult/examresult.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';

export const createExamResult = async (
  req: Request,
  res: Response
) => {
  try {
    const { body: data } = req ?? {};
    const id = await addExamResult(data);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error(`Error creating exam result: ${message}`);
    res.status(httpCode).json({ error: message });
  }
};

export const searchExamResult = async (
  req: Request,
  res: Response
) => {
  try {
    const { exam_result_id: examResultId } = req.params;
    const examResult = await searchExamResultApi(examResultId);
    res.status(200).json(examResult);
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error(`Error searching for exam result: ${message}`);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteExamResultDetails = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { exam_result_id: examResultId } = req.params;
    const deleted = await deleteExamResult(examResultId);
    logger.info('deleted exam result data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Exam Result not found' });
    }
    res.status(204).json({});
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error(`Error deleting exam result: ${message}`);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllExamResultsDetails = async (req: Request, res: Response) => {
  try {
    const examResults = await getAllExamResults();
    res.status(200).json(examResults);
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error(`Error fetching all exam results: ${message}`);
    res.status(httpCode).json({ error: message });
  }
};

export const updateExamResultDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const { exam_result_id: examResultId } = req.params;
    const data = req?.body;
    const updated = await updateExamResult(examResultId, data);
    if (!updated) {
      return res.status(404).json({ error: 'Exam Result not found' });
    }
    res.status(204).json({});
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error(`Error updating exam result: ${message}`);
    res.status(httpCode).json({ error: message });
  }
};

export const searchExamResultsByStudentId = async (
  req: Request,
  res: Response
) => {
  try {
    const { student_id: studentId } = req.params;
    const examResults = await getExamResultsByStudentId(studentId);
    res.status(200).json(examResults);
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error(`Error searching exam results by student ID: ${message}`);
    res.status(httpCode).json({ error: message });
  }
};

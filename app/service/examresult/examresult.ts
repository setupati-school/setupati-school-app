import { Request, Response } from 'express';
import {
  getAllExamResults,
  getExamResultById,
  getExamResultsByStudent,
  getExamResultsByExam,
  addExamResult,
  updateExamResult,
  deleteExamResult
} from '../../api/examresult/examresult.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';
import logger from '../../utils/logger.js';

export const createExamResult = async (req: Request, res: Response) => {
  try {
    const id = await addExamResult(req.body);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating exam result:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getExamResult = async (req: Request, res: Response) => {
  try {
    const { exam_result_id } = req.params;
    const result = await getExamResultById(exam_result_id);
    if (!result) return res.status(404).json({ error: 'Exam result not found' });
    res.status(200).json({ examResult: result });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching exam result:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllExamResultsHandler = async (req: Request, res: Response) => {
  try {
    const examResults = await getAllExamResults();
    res.status(200).json({ examResults });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all exam results:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getExamResultsByStudentHandler = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;
    const examResults = await getExamResultsByStudent(student_id);
    res.status(200).json({ examResults });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching student exam results:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getExamResultsByExamHandler = async (req: Request, res: Response) => {
  try {
    const { exam_id } = req.params;
    const examResults = await getExamResultsByExam(exam_id);
    res.status(200).json({ examResults });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching exam results by exam:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateExamResultHandler = async (req: Request, res: Response) => {
  try {
    const { exam_result_id } = req.params;
    const updated = await updateExamResult(exam_result_id, req.body);
    if (!updated) return res.status(404).json({ error: 'Exam result not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating exam result:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteExamResultHandler = async (req: Request, res: Response) => {
  try {
    const { exam_result_id } = req.params;
    const deleted = await deleteExamResult(exam_result_id);
    if (!deleted) return res.status(404).json({ error: 'Exam result not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting exam result:', message);
    res.status(httpCode).json({ error: message });
  }
};

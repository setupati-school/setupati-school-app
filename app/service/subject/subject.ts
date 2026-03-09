import { Request, Response } from 'express';
import {
  getAllSubjects,
  getSubjectById,
  addSubject,
  updateSubject,
  deleteSubject
} from '../../api/subject/subject.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';
import logger from '../../utils/logger.js';

export const createSubject = async (req: Request, res: Response) => {
  try {
    const id = await addSubject(req.body);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating subject:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getSubject = async (req: Request, res: Response) => {
  try {
    const { subject_id } = req.params;
    const subject = await getSubjectById(subject_id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.status(200).json({ subject });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching subject:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllSubjectsHandler = async (req: Request, res: Response) => {
  try {
    const subjects = await getAllSubjects();
    res.status(200).json({ subjects });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all subjects:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateSubjectHandler = async (req: Request, res: Response) => {
  try {
    const { subject_id } = req.params;
    const updated = await updateSubject(subject_id, req.body);
    if (!updated) return res.status(404).json({ error: 'Subject not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating subject:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteSubjectHandler = async (req: Request, res: Response) => {
  try {
    const { subject_id } = req.params;
    const deleted = await deleteSubject(subject_id);
    if (!deleted) return res.status(404).json({ error: 'Subject not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting subject:', message);
    res.status(httpCode).json({ error: message });
  }
};

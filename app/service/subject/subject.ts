import { Request, Response } from 'express';
import {
  addSubject,
  deleteSubject,
  getAllSubjectDetails,
  searchSubject as searchSubjectApi,
  updateSubject
} from '../../api/subject/subject.js';
import type subject from '@setupati-school/setupati-types/models';
import logger from '../../utils/logger.js';
type Subject = typeof subject;

export const createSubject = async (
  req: Request<{ Subject: Subject }>,
  res: Response
) => {
  try {
    const { body: data } = req ?? {};
    const id = await addSubject(data);
    res.status(201).json({ id });
  } catch (error) {
    logger.error('Error creating subject:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const searchSubject = async (
  req: Request<{ subject_id: string }>,
  res: Response
) => {
  try {
    const { subject_id: subjectId } = req?.params || {};
    if (!subjectId) {
      res.status(400).json({ error: 'Subject ID is required' });
    }
    const subjects = await searchSubjectApi(subjectId);
    res.status(200).json(subjects);
  } catch (error) {
    logger.error('Error searching for subjects:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteSubjectDetails = async (
  req: Request<{ subject_id: string }>,
  res: Response
): Promise<Response | void> => {
  try {
    const { subject_id: subjectId } = req?.params || {};
    if (!subjectId) {
      res.status(400).json({ error: 'Subject ID is required' });
    }
    const deleted = await deleteSubject(subjectId);
    if (!deleted) {
      res.status(404).json({ error: 'Subject not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error deleting subject details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await getAllSubjectDetails();
    res.status(200).json(subjects);
  } catch (error) {
    logger.error('Error fetching all subjects:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateSubjectDetails = async (
  req: Request<{ subject_id: string; Subject: Partial<Subject> }>,
  res: Response
) => {
  try {
    const { subject_id: subjectId } = req?.params || {};
    const data = req?.body;
    if (!subjectId) {
      res.status(400).json({ error: 'Subject ID is required' });
    }
    const updated = await updateSubject(subjectId, data);
    if (!updated) {
      res.status(404).json({ error: 'Subject not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error updating subject details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

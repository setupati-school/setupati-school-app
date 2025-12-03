import { Request, Response } from 'express';
import {
  addSubject,
  deleteSubject,
  getAllSubjectDetails,
  searchSubject as searchSubjectApi,
  updateSubject
} from '../../api/subject/subject.js';
import logger from '../../utils/logger.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';

interface SubjectWithDates extends Record<string, unknown> {
  subject_name?: string;
  grade_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const createSubject = async (req: Request, res: Response) => {
  try {
    const data = req?.body || {};
    const id = await addSubject(data);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating subject:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const searchSubject = async (req: Request, res: Response) => {
  try {
    const { subject_id: subjectId } = req?.params || {};
    const subjects = await searchSubjectApi(subjectId);
    res.status(200).json(subjects);
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error searching for subjects:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteSubjectDetails = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { subject_id: subjectId } = req?.params || {};
    const deleted = await deleteSubject(subjectId);
    logger.info('deleted subject data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.status(204).json({});
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting subject details:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const rawSubjects = await getAllSubjectDetails();

    const subjects = rawSubjects
      ?.filter((item) => item?.subject !== null)
      ?.map((item) => ({
        id: item?.id,
        ...(item?.subject as SubjectWithDates)
      })) || [];

    // Sort by subject name
    subjects?.sort((a, b) => {
      const nameA = (a?.subject_name || '').toLowerCase();
      const nameB = (b?.subject_name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    res.status(200).json({ subjects });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all subjects:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateSubjectDetails = async (req: Request, res: Response) => {
  try {
    const { subject_id: subjectId } = req?.params || {};
    const data = req?.body || {};
    const updated = await updateSubject(subjectId, data);
    if (!updated) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.status(204).json({});
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating subject details:', message);
    res.status(httpCode).json({ error: message });
  }
};

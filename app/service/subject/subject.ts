import { Request, Response } from 'express';
import {
  addSubject,
  deleteSubject,
  getAllSubjectDetails,
  searchSubject as searchSubjectApi,
  updateSubject
} from '../../api/subject/subject.js';
import logger from '../../utils/logger.js';

interface SubjectWithDates extends Record<string, unknown> {
  subject_name?: string;
  grade_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const createSubject = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const id = await addSubject(data);
    res.status(201).json({ id });
  } catch (error) {
    logger.error('Error creating subject:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const searchSubject = async (req: Request, res: Response) => {
  try {
    const subjectId = req.params.subject_id;
    if (!subjectId) {
      return res.status(400).json({ error: 'Subject ID is required' });
    }
    const subjects = await searchSubjectApi(subjectId);
    res.status(200).json(subjects);
  } catch (error) {
    logger.error('Error searching for subjects:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteSubjectDetails = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const subjectId = req.params.subject_id;
    if (!subjectId) {
      return res.status(400).json({ error: 'Subject ID is required' });
    }
    const deleted = await deleteSubject(subjectId);
    logger.info('deleted subject data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error deleting subject details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const rawSubjects = await getAllSubjectDetails();

    const subjects = rawSubjects
      .filter((item) => item.subject !== null)
      .map((item) => ({
        id: item.id,
        ...(item.subject as SubjectWithDates)
      }));

    // Sort by subject name
    subjects.sort((a, b) => {
      const nameA = (a.subject_name || '').toLowerCase();
      const nameB = (b.subject_name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    res.status(200).json({ subjects });
  } catch (error) {
    logger.error('Error fetching all subjects:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateSubjectDetails = async (req: Request, res: Response) => {
  try {
    const subjectId = req.params.subject_id;
    if (!subjectId) {
      return res.status(400).json({ error: 'Subject ID is required' });
    }
    const data = req.body;
    const updated = await updateSubject(subjectId, data);
    if (!updated) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error updating subject details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

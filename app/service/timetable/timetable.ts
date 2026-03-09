import { Request, Response } from 'express';
import {
  getAllTimetables,
  getTimetableById,
  getTimetableBySection,
  addTimetable,
  updateTimetable,
  deleteTimetable
} from '../../api/timetable/timetable.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';
import logger from '../../utils/logger.js';

export const createTimetable = async (req: Request, res: Response) => {
  try {
    const id = await addTimetable(req.body);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating timetable:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getTimetable = async (req: Request, res: Response) => {
  try {
    const { timetable_id } = req.params;
    const timetable = await getTimetableById(timetable_id);
    if (!timetable) return res.status(404).json({ error: 'Timetable not found' });
    res.status(200).json({ timetable });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching timetable:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllTimetablesHandler = async (req: Request, res: Response) => {
  try {
    const timetables = await getAllTimetables();
    res.status(200).json({ timetables });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all timetables:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getTimetableBySectionHandler = async (req: Request, res: Response) => {
  try {
    const { section_id } = req.params;
    const timetables = await getTimetableBySection(section_id);
    res.status(200).json({ timetables });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching section timetable:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateTimetableHandler = async (req: Request, res: Response) => {
  try {
    const { timetable_id } = req.params;
    const updated = await updateTimetable(timetable_id, req.body);
    if (!updated) return res.status(404).json({ error: 'Timetable not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating timetable:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteTimetableHandler = async (req: Request, res: Response) => {
  try {
    const { timetable_id } = req.params;
    const deleted = await deleteTimetable(timetable_id);
    if (!deleted) return res.status(404).json({ error: 'Timetable not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting timetable:', message);
    res.status(httpCode).json({ error: message });
  }
};

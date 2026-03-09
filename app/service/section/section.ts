import { Request, Response } from 'express';
import {
  getAllSections,
  getSectionById,
  addSection,
  updateSection,
  deleteSection
} from '../../api/section/section.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';
import logger from '../../utils/logger.js';

export const createSection = async (req: Request, res: Response) => {
  try {
    const id = await addSection(req.body);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating section:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getSection = async (req: Request, res: Response) => {
  try {
    const { section_id } = req.params;
    const section = await getSectionById(section_id);
    if (!section) return res.status(404).json({ error: 'Section not found' });
    res.status(200).json({ section });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching section:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllSectionsHandler = async (req: Request, res: Response) => {
  try {
    const sections = await getAllSections();
    res.status(200).json({ sections });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all sections:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateSectionHandler = async (req: Request, res: Response) => {
  try {
    const { section_id } = req.params;
    const updated = await updateSection(section_id, req.body);
    if (!updated) return res.status(404).json({ error: 'Section not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating section:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteSectionHandler = async (req: Request, res: Response) => {
  try {
    const { section_id } = req.params;
    const deleted = await deleteSection(section_id);
    if (!deleted) return res.status(404).json({ error: 'Section not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting section:', message);
    res.status(httpCode).json({ error: message });
  }
};

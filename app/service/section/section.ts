import { Request, Response } from 'express';
import {
  addSection,
  deleteSection,
  getAllSectionDetails,
  searchSection as searchSectionApi,
  updateSection
} from '../../api/section/section.js';
import type section from '@setupati-school/setupati-types/models';
import logger from '../../utils/logger.js';
type Section = typeof section;

export const createSection = async (
  req: Request<{ Section: Section }>,
  res: Response
) => {
  try {
    const { body: data } = req ?? {};
    const id = await addSection(data);
    res.status(201).json({ id });
  } catch (error) {
    logger.error('Error creating section:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const searchSection = async (
  req: Request<{ section_id: string }>,
  res: Response
) => {
  try {
    const { section_id: sectionId } = req.params;
    if (!sectionId) {
      return res.status(400).json({ error: 'Section ID is required' });
    }
    const sections = await searchSectionApi(sectionId);
    res.status(200).json(sections);
  } catch (error) {
    logger.error('Error searching for sections:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteSectionDetails = async (
  req: Request<{ section_id: string }>,
  res: Response
): Promise<Response | void> => {
  try {
    const { section_id: sectionId } = req.params;
    if (!sectionId) {
      return res.status(400).json({ error: 'Section ID is required' });
    }
    const deleted = await deleteSection(sectionId);
    logger.info('deleted section data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error deleting section details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllSections = async (req: Request, res: Response) => {
  try {
    const sections = await getAllSectionDetails();
    res.status(200).json(sections);
  } catch (error) {
    logger.error('Error fetching all sections:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateSectionDetails = async (
  req: Request<{ section_id: string; Section: Partial<Section> }>,
  res: Response
) => {
  try {
    const { section_id: sectionId } = req.params;
    if (!sectionId) {
      return res.status(400).json({ error: 'Section ID is required' });
    }
    const data = req?.body;
    const updated = await updateSection(sectionId, data);
    if (!updated) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error updating section details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

import { Request, Response } from 'express';
import type circular from '@setupati-school/setupati-types/models';
import logger from '../../utils/logger.js';
import {
  addCircular,
  deleteCircular,
  getAllCircularDetails,
  updateCircular,
  searchCircular as searchCircularApi
} from '../../api/circular/circular.js';
type Circular = typeof circular;

// Extended type for circular with dates
interface CircularWithDates extends Record<string, unknown> {
  issued_date?: string;
  valid_until?: string;
}

export const createCircular = async (
  req: Request<{ Circular: Circular }>,
  res: Response
) => {
  try {
    const { body: data } = req ?? {};
    const id = await addCircular(data);
    res.status(201).json({ id });
  } catch (error) {
    logger.error('Error creating circular:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const searchCircular = async (
  req: Request<{ circular_id: string }>,
  res: Response
) => {
  try {
    const { circular_id: circularId } = req.params;
    if (!circularId) {
      return res.status(400).json({ error: 'Circular ID is required' });
    }
    const circulars = await searchCircularApi(circularId);
    res.status(200).json(circulars);
  } catch (error) {
    logger.error('Error searching for circulars:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteCircularDetails = async (
  req: Request<{ circular_id: string }>,
  res: Response
): Promise<Response | void> => {
  try {
    const { circular_id: circularId } = req.params;
    if (!circularId) {
      return res.status(400).json({ error: 'Circular ID is required' });
    }
    const deleted = await deleteCircular(circularId);
    logger.info('deleted circular data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Circular not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error deleting circular details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllCirculars = async (req: Request, res: Response) => {
  try {
    const rawCirculars = await getAllCircularDetails();

    const circulars = rawCirculars
      .filter((item) => item.circular !== null)
      .map((item) => ({
        id: item.id,
        ...(item.circular as CircularWithDates)
      }));

    circulars.sort((a, b) => {
      const dateA = new Date(a.issued_date || 0).getTime();
      const dateB = new Date(b.issued_date || 0).getTime();
      return dateB - dateA;
    });

    res.status(200).json({ circulars });
  } catch (error) {
    logger.error('Error fetching all circulars:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateCircularDetails = async (
  req: Request<{ circular_id: string; Circular: Partial<Circular> }>,
  res: Response
) => {
  try {
    const { circular_id: circularId } = req.params;
    if (!circularId) {
      return res.status(400).json({ error: 'Circular ID is required' });
    }
    const data = req?.body;
    const updated = await updateCircular(circularId, data);
    if (!updated) {
      return res.status(404).json({ error: 'Circular not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error updating circular details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

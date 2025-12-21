import { Request, Response } from 'express';
import logger from '../../utils/logger.js';
import {
  addCircular,
  deleteCircular,
  getAllCircularDetails,
  updateCircular,
  searchCircular as searchCircularApi
} from '../../api/circular/circular.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';

interface CircularWithDates extends Record<string, unknown> {
  issued_date?: string;
  valid_until?: string;
}

export const createCircular = async (req: Request, res: Response) => {
  try {
    const data = req?.body || {};
    const id = await addCircular(data);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating circular:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const searchCircular = async (req: Request, res: Response) => {
  try {
    const { circular_id: circularId } = req?.params || {};
    const circulars = await searchCircularApi(circularId);
    res.status(200).json(circulars);
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error searching for circulars:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteCircularDetails = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { circular_id: circularId } = req?.params || {};
    const deleted = await deleteCircular(circularId);
    logger.info('deleted circular data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Circular not found' });
    }
    res.status(204).json({});
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting circular details:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllCirculars = async (req: Request, res: Response) => {
  try {
    const rawCirculars = await getAllCircularDetails();

    const circulars = rawCirculars
      ?.filter((item) => item?.circular !== null)
      ?.map((item) => ({
        id: item?.id,
        ...(item?.circular as CircularWithDates)
      })) || [];

    circulars?.sort((a, b) => {
      const dateA = new Date(a?.issued_date || 0).getTime();
      const dateB = new Date(b?.issued_date || 0).getTime();
      return dateB - dateA;
    });

    res.status(200).json({ circulars });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all circulars:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateCircularDetails = async (req: Request, res: Response) => {
  try {
    const { circular_id: circularId } = req?.params || {};
    const data = req?.body || {};
    const updated = await updateCircular(circularId, data);
    if (!updated) {
      return res.status(404).json({ error: 'Circular not found' });
    }
    res.status(204).json({});
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating circular details:', message);
    res.status(httpCode).json({ error: message });
  }
};

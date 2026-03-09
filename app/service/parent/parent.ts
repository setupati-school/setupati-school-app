import { Request, Response } from 'express';
import {
  getAllParents,
  getParentById,
  addParent,
  updateParent,
  deleteParent
} from '../../api/parent/parent.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';
import logger from '../../utils/logger.js';

export const createParent = async (req: Request, res: Response) => {
  try {
    const id = await addParent(req.body);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating parent:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getParent = async (req: Request, res: Response) => {
  try {
    const { parent_id } = req.params;
    const parent = await getParentById(parent_id);
    if (!parent) return res.status(404).json({ error: 'Parent not found' });
    res.status(200).json({ parent });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching parent:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllParentsHandler = async (req: Request, res: Response) => {
  try {
    const parents = await getAllParents();
    res.status(200).json({ parents });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all parents:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateParentHandler = async (req: Request, res: Response) => {
  try {
    const { parent_id } = req.params;
    const updated = await updateParent(parent_id, req.body);
    if (!updated) return res.status(404).json({ error: 'Parent not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating parent:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteParentHandler = async (req: Request, res: Response) => {
  try {
    const { parent_id } = req.params;
    const deleted = await deleteParent(parent_id);
    if (!deleted) return res.status(404).json({ error: 'Parent not found' });
    res.status(204).send();
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting parent:', message);
    res.status(httpCode).json({ error: message });
  }
};

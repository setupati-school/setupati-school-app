import { Request, Response } from 'express';
import type parent from '@setupati-school/setupati-types/models';
import logger from '../../utils/logger.js';
import {
  addParent,
  deleteParent,
  getAllParentDetails,
  updateParent,
  searchParent as searchParentApi
} from '../../api/parent/parent.js';
type Parent = typeof parent;

export const createParent = async (
  req: Request<{ Parent: Parent }>,
  res: Response
) => {
  try {
    const { body: data } = req ?? {};
    const id = await addParent(data);
    res.status(201).json({ id });
  } catch (error) {
    logger.error('Error creating parent:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const searchParent = async (
  req: Request<{ parent_id: string }>,
  res: Response
) => {
  try {
    const { parent_id: parentId } = req.params;
    if (!parentId) {
      return res.status(400).json({ error: 'Parent ID is required' });
    }
    const parents = await searchParentApi(parentId);
    res.status(200).json(parents);
  } catch (error) {
    logger.error('Error searching for parents:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteParentDetails = async (
  req: Request<{ parent_id: string }>,
  res: Response
): Promise<Response | void> => {
  try {
    const { parent_id: parentId } = req.params;
    if (!parentId) {
      return res.status(400).json({ error: 'Parent ID is required' });
    }
    const deleted = await deleteParent(parentId);
    logger.info('deleted parent data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Parent not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error deleting parent details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllParents = async (req: Request, res: Response) => {
  try {
    const parents = await getAllParentDetails();
    res.status(200).json(parents);
  } catch (error) {
    logger.error('Error fetching all parents:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateParentDetails = async (
  req: Request<{ parent_id: string; Parent: Partial<Parent> }>,
  res: Response
) => {
  try {
    const { parent_id: parentId } = req.params;
    if (!parentId) {
      return res.status(400).json({ error: 'Parent ID is required' });
    }
    const data = req?.body;
    const updated = await updateParent(parentId, data);
    if (!updated) {
      return res.status(404).json({ error: 'Parent not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error updating parent details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

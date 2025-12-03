import { Request, Response } from 'express';
import logger from '../../utils/logger.js';
import {
  addTimeTable,
  updateTimeTable,
  searchTimeTable as searchTimeTableApi,
  deleteTimeTable,
  getAllTimeTables
} from '../../api/timetable/timetable.js';
import { firebaseErrorParser } from '../../Error/firebaseErrorParser.js';

export const createTimeTable = async (req: Request, res: Response) => {
  try {
    const data = req?.body || {};
    const id = await addTimeTable(data);
    res.status(201).json({ id });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error creating time table:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const searchTimeTable = async (req: Request, res: Response) => {
  try {
    const { time_table_id: timeTableId } = req?.params || {};
    const timeTable = await searchTimeTableApi(timeTableId);
    res.status(200).json(timeTable);
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error searching for time table:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const deleteTimeTableDetails = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { time_table_id: timeTableId } = req?.params || {};
    const deleted = await deleteTimeTable(timeTableId);
    logger.info('deleted time table data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Time Table not found' });
    }
    res.status(204).json({});
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error deleting time table:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const getAllTimeTablesDetails = async (req: Request, res: Response) => {
  try {
    const timetables = await getAllTimeTables();
    res.status(200).json({ timetables });
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error fetching all time tables:', message);
    res.status(httpCode).json({ error: message });
  }
};

export const updateTimeTableDetails = async (req: Request, res: Response) => {
  try {
    const { time_table_id: timeTableId } = req?.params || {};
    const data = req?.body || {};
    const updated = await updateTimeTable(timeTableId, data);
    if (!updated) {
      return res.status(404).json({ error: 'Time Table not found' });
    }
    res.status(204).json({});
  } catch (error) {
    const { httpCode, message } = firebaseErrorParser(error);
    logger.error('Error updating time table:', message);
    res.status(httpCode).json({ error: message });
  }
};

import { Request, Response } from 'express';
import type timeTable from '@setupati-school/setupati-types/models';
import logger from '../../utils/logger.js';
import {
  addTimeTable,
  updateTimeTable,
  searchTimeTable as searchTimeTableApi,
  deleteTimeTable,
  getAllTimeTables
} from '../../api/timetable/timetable.js';
type TimeTable = typeof timeTable;

export const createTimeTable = async (
  req: Request<{ TimeTable: TimeTable }>,
  res: Response
) => {
  try {
    const { body: data } = req ?? {};
    const id = await addTimeTable(data);
    res.status(201).json({ id });
  } catch (error) {
    logger.error('Error creating time table:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const searchTimeTable = async (
  req: Request<{ time_table_id: string }>,
  res: Response
) => {
  try {
    const { time_table_id: timeTableId } = req.params;
    if (!timeTableId) {
      return res.status(400).json({ error: 'Time Table ID is required' });
    }
    const timeTable = await searchTimeTableApi(timeTableId);
    res.status(200).json(timeTable);
  } catch (error) {
    logger.error('Error searching for time table:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteTimeTableDetails = async (
  req: Request<{ time_table_id: string }>,
  res: Response
): Promise<Response | void> => {
  try {
    const { time_table_id: timeTableId } = req.params;
    if (!timeTableId) {
      return res.status(400).json({ error: 'Time Table ID is required' });
    }
    const deleted = await deleteTimeTable(timeTableId);
    logger.info('deleted time table data', deleted);
    if (!deleted) {
      return res.status(404).json({ error: 'Time Table not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error deleting time table:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllTimeTablesDetails = async (req: Request, res: Response) => {
  try {
    const timeTables = await getAllTimeTables();
    res.status(200).json(timeTables);
  } catch (error) {
    logger.error('Error fetching all time tables:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateTimeTableDetails = async (
  req: Request<{ time_table_id: string; TimeTable: Partial<TimeTable> }>,
  res: Response
) => {
  try {
    const { time_table_id: timeTableId } = req.params;
    if (!timeTableId) {
      return res.status(400).json({ error: 'Time Table ID is required' });
    }
    const data = req?.body;
    const updated = await updateTimeTable(timeTableId, data);
    if (!updated) {
      return res.status(404).json({ error: 'Time Table not found' });
    }
    res.status(204).json({});
  } catch (error) {
    logger.error('Error updating time table:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

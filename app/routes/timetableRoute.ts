import { Router } from 'express';
import {
  createTimeTable,
  searchTimeTable,
  deleteTimeTableDetails,
  getAllTimeTablesDetails,
  updateTimeTableDetails
} from '../service/timetable/timetable.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';

const timeTableRouter = Router();

// Admin only - Create timetable entry
timeTableRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  createTimeTable
);

// Public - Search timetable by ID
timeTableRouter.get('/search/:time_table_id', searchTimeTable);

// Admin only - Delete timetable entry
timeTableRouter.delete(
  '/delete/:time_table_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  deleteTimeTableDetails
);

// Public - Get all timetables
timeTableRouter.get('/all', getAllTimeTablesDetails);

// Admin only - Update timetable entry
timeTableRouter.put(
  '/update/:time_table_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  updateTimeTableDetails
);

export default timeTableRouter;

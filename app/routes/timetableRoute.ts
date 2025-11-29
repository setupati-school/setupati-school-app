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

timeTableRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  createTimeTable
);


timeTableRouter.get('/search/:time_table_id', searchTimeTable);

timeTableRouter.delete(
  '/delete/:time_table_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  deleteTimeTableDetails
);

timeTableRouter.get('/all', getAllTimeTablesDetails);

timeTableRouter.put(
  '/update/:time_table_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  updateTimeTableDetails
);

export default timeTableRouter;

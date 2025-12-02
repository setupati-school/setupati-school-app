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
import { validateBody } from '../middlewares/validateRequest.js';
import {
  createTimetableSchema,
  updateTimetableSchema
} from '../zod/timetableSchema.js';

const timeTableRouter = Router();

timeTableRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(createTimetableSchema),
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
  validateBody(updateTimetableSchema),
  updateTimeTableDetails
);

export default timeTableRouter;

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
  (req, res) => {
  createTimeTable(req, res);
  } 
);


timeTableRouter.get('/search/:time_table_id', isAuthenticated, (req, res) => {
  searchTimeTable(req, res);
});
timeTableRouter.delete(
  '/delete/:time_table_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => {
  deleteTimeTableDetails(req, res);
  } 
);

timeTableRouter.get('/all', isAuthenticated, (req, res) => {
  getAllTimeTablesDetails(req, res);
});

timeTableRouter.put(
  '/update/:time_table_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(updateTimetableSchema),
  (req, res) => {
  updateTimeTableDetails(req, res);
  } 
);

export default timeTableRouter;

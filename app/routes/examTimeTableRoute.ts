import { Router, Request, Response } from 'express';
import type examTimeTable from '@setupati-school/setupati-types/models';
import {
  createExamTimeTable,
  searchExamTimeTable,
  deleteExamTimeTableDetails,
  getAllExamTimeTablesDetails,
  updateExamTimeTableDetails
} from '../service/examtimetable/examtimetable.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';
import { validateBody } from '../middlewares/validateRequest.js';
import {
  createExamTimetableSchema,
  updateExamTimetableSchema
} from '../zod/examTimeTableSchema.js';

const examTimeTableRouter = Router();

examTimeTableRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(createExamTimetableSchema),
  (req,res) =>  {
    createExamTimeTable(req, res)
  }
);

examTimeTableRouter.get(
  '/search/:exam_time_table_id', isAuthenticated,
  (req, res) => {
    searchExamTimeTable(req, res);
  }
);

examTimeTableRouter.delete(
  '/delete/:exam_time_table_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => {
    deleteExamTimeTableDetails(req, res);
  }
);

examTimeTableRouter.get('/all',isAuthenticated, (req, res) => {
  return getAllExamTimeTablesDetails(req, res);
});

examTimeTableRouter.put(
  '/update/:exam_time_table_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  validateBody(updateExamTimetableSchema),
  (req, res) => {
  updateExamTimeTableDetails(req, res);
  }
);

export default examTimeTableRouter;

import { Router, Request, Response } from 'express';
import type timeTable from '@setupati-school/setupati-types/models';
import {
  createTimeTable,
  searchTimeTable,
  deleteTimeTableDetails,
  getAllTimeTablesDetails,
  updateTimeTableDetails
} from '../service/timetable/timetable.js';
type TimeTable = typeof timeTable;

const timeTableRouter = Router();

timeTableRouter.post(
  '/create',
  (req: Request<{ TimeTable: TimeTable }>, res: Response) => {
    createTimeTable(req, res);
  }
);

timeTableRouter.get(
  '/search/:time_table_id',
  (req: Request<{ time_table_id: string }>, res: Response) => {
    searchTimeTable(req, res);
  }
);

timeTableRouter.delete(
  '/delete/:time_table_id',
  (req: Request<{ time_table_id: string }>, res: Response) => {
    deleteTimeTableDetails(req, res);
  }
);

timeTableRouter.get('/all', (req: Request, res: Response) => {
  return getAllTimeTablesDetails(req, res);
});

timeTableRouter.put(
  '/update/:time_table_id',
  (
    req: Request<{ time_table_id: string; TimeTable: Partial<TimeTable> }>,
    res: Response
  ) => {
    updateTimeTableDetails(req, res);
  }
);

export default timeTableRouter;

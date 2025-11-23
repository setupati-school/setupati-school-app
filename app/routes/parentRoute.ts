import { Router, Request, Response } from 'express';
import type parent from '@setupati-school/setupati-types/models';
import {
  createParent,
  getAllParents,
  searchParent,
  deleteParentDetails,
  updateParentDetails
} from '../service/parent/parent.js';

type Parent = typeof parent;

const parentRouter = Router();

parentRouter.post(
  '/create',
  (req: Request<{ Parent: Parent }>, res: Response) => {
    createParent(req, res);
  }
);

parentRouter.get(
  '/search/:parent_id',
  (req: Request<{ parent_id: string }>, res: Response) => {
    searchParent(req, res);
  }
);

parentRouter.delete(
  '/delete/:parent_id',
  (req: Request<{ parent_id: string }>, res: Response) => {
    deleteParentDetails(req, res);
  }
);

parentRouter.get('/all', (req: Request, res: Response) => {
  return getAllParents(req, res);
});

parentRouter.put(
  '/update/:parent_id',
  (
    req: Request<{ parent_id: string; Parent: Partial<Parent> }>,
    res: Response
  ) => {
    updateParentDetails(req, res);
  }
);

export default parentRouter;

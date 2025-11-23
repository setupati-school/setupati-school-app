import { Router, Request, Response } from 'express';
import type circular from '@setupati-school/setupati-types/models';
import {
  createCircular,
  deleteCircularDetails,
  getAllCirculars,
  searchCircular,
  updateCircularDetails
} from '../service/circular/circular.js';
type Circular = typeof circular;

const circularRouter = Router();

circularRouter.post(
  '/create',
  (req: Request<{ Circular: Circular }>, res: Response) => {
    createCircular(req, res);
  }
);

circularRouter.get(
  '/search/:circular_id',
  (req: Request<{ circular_id: string }>, res: Response) => {
    searchCircular(req, res);
  }
);

circularRouter.delete(
  '/delete/:circular_id',
  (req: Request<{ circular_id: string }>, res: Response) => {
    deleteCircularDetails(req, res);
  }
);

circularRouter.get('/all', (req: Request, res: Response) => {
  return getAllCirculars(req, res);
});

circularRouter.put(
  '/update/:circular_id',
  (
    req: Request<{ circular_id: string; Circular: Partial<Circular> }>,
    res: Response
  ) => {
    updateCircularDetails(req, res);
  }
);

export default circularRouter;

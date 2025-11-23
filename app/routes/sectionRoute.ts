import {
  createSection,
  searchSection,
  deleteSectionDetails,
  getAllSections,
  updateSectionDetails
} from '../service/section/section.js';
import { Router, Request, Response } from 'express';
import type section from '@setupati-school/setupati-types/models';
type Section = typeof section;

const sectionRouter = Router();

sectionRouter.post(
  '/create',
  (req: Request<{ Section: Section }>, res: Response) => {
    createSection(req, res);
  }
);

sectionRouter.get(
  '/search/:section_id',
  (req: Request<{ section_id: string }>, res: Response) => {
    searchSection(req, res);
  }
);

sectionRouter.delete(
  '/delete/:section_id',
  (req: Request<{ section_id: string }>, res: Response) => {
    deleteSectionDetails(req, res);
  }
);

sectionRouter.get('/all', (req: Request, res: Response) => {
  return getAllSections(req, res);
});

sectionRouter.put(
  '/update/:section_id',
  (
    req: Request<{ section_id: string; Section: Partial<Section> }>,
    res: Response
  ) => {
    updateSectionDetails(req, res);
  }
);

export default sectionRouter;

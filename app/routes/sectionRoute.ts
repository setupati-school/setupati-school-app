import { Router } from 'express';
import {
  createSection,
  getSection,
  getAllSectionsHandler,
  updateSectionHandler,
  deleteSectionHandler
} from '../service/section/section.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAuthorized } from '../middlewares/isAuthorized.js';

const sectionRouter = Router();

sectionRouter.post(
  '/create',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => createSection(req, res)
);

sectionRouter.get('/all', isAuthenticated, (req, res) => getAllSectionsHandler(req, res));

sectionRouter.get('/:section_id', isAuthenticated, (req, res) => getSection(req, res));

sectionRouter.put(
  '/:section_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => updateSectionHandler(req, res)
);

sectionRouter.delete(
  '/:section_id',
  isAuthenticated,
  isAuthorized({ hasRole: ['admin'] }),
  (req, res) => deleteSectionHandler(req, res)
);

export default sectionRouter;

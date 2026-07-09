import express from 'express';
import { eventController } from './event.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

router.use(authenticate);
router.get('/calendar', eventController.getCalendarEvents);
// CRUD
router.post('/', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY), eventController.create);
router.get('/', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), eventController.findAll);
router.get('/my', eventController.getMyEvents);
router.get('/case/:caseId', eventController.getByCase);
router.get('/:id', eventController.findOne);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY), eventController.update);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER), eventController.remove);

export { router as eventRoutes };
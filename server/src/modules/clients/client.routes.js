import express from 'express';
import { clientController } from './client.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY),
  clientController.create
);

router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY),
  clientController.findAll
);

router.get(
  '/statistics',
  authorize(ROLES.ADMIN, ROLES.LAWYER),
  clientController.getStatistics
);

router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY),
  clientController.findOne
);

router.get(
  '/:id/cases',
  authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY),
  clientController.getCaseHistory
);

router.get(
  '/:id/payments',
  authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY),
  clientController.getPayments
);

router.get(
  '/:id/notes',
  authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY),
  clientController.getNotes
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY),
  clientController.update
);

router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  clientController.remove
);

export { router as clientRoutes };
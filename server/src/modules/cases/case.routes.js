import express from 'express';
import { caseController } from './case.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

router.use(authenticate);

// Main CRUD
router.post('/', authorize(ROLES.ADMIN, ROLES.LAWYER), caseController.create);
router.get('/', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), caseController.findAll);
router.get('/statistics', authorize(ROLES.ADMIN, ROLES.LAWYER), caseController.getStatistics);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), caseController.findOne);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER), caseController.update);
router.delete('/:id', authorize(ROLES.ADMIN), caseController.remove);

// Status
router.patch('/:id/status', authorize(ROLES.ADMIN, ROLES.LAWYER), caseController.updateStatus);

// Parties
router.post('/:id/parties', authorize(ROLES.ADMIN, ROLES.LAWYER), caseController.addParty);
router.delete('/:id/parties/:partyId', authorize(ROLES.ADMIN, ROLES.LAWYER), caseController.removeParty);
router.get('/:id/parties', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), caseController.getParties);

// Related data
router.get('/:id/documents', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), caseController.getDocuments);
router.get('/:id/tasks', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), caseController.getTasks);
router.get('/:id/events', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), caseController.getEvents);
router.get('/:id/payments', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY), caseController.getPayments);
router.get('/:id/notes', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), caseController.getNotes);

export { router as caseRoutes };
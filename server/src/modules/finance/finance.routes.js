import express from 'express';
import { financeController } from './finance.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

router.use(authenticate);

// Payment CRUD
router.post('/', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY), financeController.createPayment);
router.get('/', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), financeController.findAllPayments);
router.get('/summary', authorize(ROLES.ADMIN, ROLES.LAWYER), financeController.getFinancialSummary);
router.get('/monthly-revenue', authorize(ROLES.ADMIN, ROLES.LAWYER), financeController.getMonthlyRevenue);
router.get('/outstanding', authorize(ROLES.ADMIN, ROLES.LAWYER), financeController.getOutstandingPayments);
router.get('/statistics', authorize(ROLES.ADMIN, ROLES.LAWYER), financeController.getPaymentStatistics);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), financeController.findOnePayment);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY), financeController.updatePayment);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER), financeController.removePayment);

// Client-specific
router.get('/client/:clientId', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY), financeController.getClientPayments);
router.get('/client/:clientId/summary', authorize(ROLES.ADMIN, ROLES.LAWYER), financeController.getClientFinancialSummary);

// Case-specific
router.get('/case/:caseId', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY), financeController.getCasePayments);

export { router as financeRoutes };
import express from 'express';
import { casePartyController } from './case-party.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// ✅ Tüm route'lar için kimlik doğrulama
router.use(authenticate);

// 📌 CaseParty Routes
router.post('/case/:caseId', casePartyController.create);
router.get('/case/:caseId', casePartyController.getByCase);
router.get('/', casePartyController.findAll);
router.get('/:id', casePartyController.findOne);
router.put('/:id', casePartyController.update);
router.delete('/:id', casePartyController.remove);

export { router as casePartyRoutes };
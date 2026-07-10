import { Router } from 'express';
import { powerOfAttorneyController } from './powerOfAttorney.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';  // ✅ DÜZELTİLDİ
import { validate } from '../../middlewares/validate.middleware.js';
import { body } from 'express-validator';

const router = Router();

// ✅ Validation Rules
const createValidation = [
  body('client_id').notEmpty().withMessage('Müvekkil seçimi zorunludur'),
  body('title').notEmpty().withMessage('Başlık zorunludur'),
];

const updateValidation = [
  body('title').optional().notEmpty().withMessage('Başlık boş olamaz'),
];

// ✅ Tüm rotalar auth gerektirir (searchRoutes ile aynı stil)
router.use(authenticate);  // ✅ DÜZELTİLDİ

// 📋 Vekaletname İşlemleri
router.get('/', powerOfAttorneyController.findAll);
router.get('/statistics', powerOfAttorneyController.getStatistics);
router.get('/client/:clientId', powerOfAttorneyController.findByClient);
router.get('/:id', powerOfAttorneyController.findOne);

router.post('/', validate(createValidation), powerOfAttorneyController.create);

router.put('/:id', validate(updateValidation), powerOfAttorneyController.update);
router.patch('/:id/status', powerOfAttorneyController.updateStatus);
router.delete('/:id', powerOfAttorneyController.delete);

export { router as powerOfAttorneyRoutes };
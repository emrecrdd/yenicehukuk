import { Router } from 'express';
import { powerOfAttorneyController } from './powerOfAttorney.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { uploadSingle } from '../../middlewares/upload.middleware.js';  // ✅ EKLENDI
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

// ✅ Tüm rotalar auth gerektirir
router.use(authenticate);

// 📋 Vekaletname İşlemleri
router.get('/', powerOfAttorneyController.findAll);
router.get('/statistics', powerOfAttorneyController.getStatistics);
router.get('/client/:clientId', powerOfAttorneyController.findByClient);
router.get('/:id', powerOfAttorneyController.findOne);

// ✅ DOSYA YÜKLEME DESTEĞİ EKLENDI
router.post(
  '/', 
  uploadSingle('file'),  // ✅ 'file' input name ile eşleşmeli!
  validate(createValidation), 
  powerOfAttorneyController.create
);

router.put('/:id', validate(updateValidation), powerOfAttorneyController.update);
router.patch('/:id/status', powerOfAttorneyController.updateStatus);
router.delete('/:id', powerOfAttorneyController.delete);

export { router as powerOfAttorneyRoutes };
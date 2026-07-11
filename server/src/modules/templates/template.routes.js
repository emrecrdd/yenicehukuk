import { Router } from 'express';
import { templateController } from './template.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { uploadSingle } from '../../middlewares/upload.middleware.js';

const router = Router();

router.use(authenticate);

// 📋 Şablon İşlemleri
router.get('/', templateController.findAll);
router.get('/categories', templateController.getCategories);
router.get('/law-areas', templateController.getLawAreas);
router.get('/:id', templateController.findOne);
router.get('/:id/download', templateController.download);

// ✅ Oluşturma ve Güncelleme (Admin ve Avukat)
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.LAWYER),
  uploadSingle('file'),
  templateController.create
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.LAWYER),
  uploadSingle('file'),
  templateController.update
);

router.delete('/:id', authorize(ROLES.ADMIN), templateController.remove);

export { router as templateRoutes };
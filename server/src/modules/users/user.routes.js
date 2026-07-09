import express from 'express';
import { userController } from './user.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

router.use(authenticate);

// ✅ Sadece admin kullanıcıları görebilir
router.get('/', authorize(ROLES.ADMIN), userController.findAll);
router.get('/:id', userController.findOne);

// ✅ Admin işlemleri
router.put('/:id', authorize(ROLES.ADMIN), userController.update);
router.delete('/:id', authorize(ROLES.ADMIN), userController.delete);
router.patch('/:id/toggle-active', authorize(ROLES.ADMIN), userController.toggleActive);
router.patch('/:id/role', authorize(ROLES.ADMIN), userController.changeRole);

export { router as userRoutes };
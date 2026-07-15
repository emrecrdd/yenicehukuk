import express from 'express';
import { auditLogController } from './audit-log.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

// ✅ Tüm route'lar için kimlik doğrulama
router.use(authenticate);

// 📌 AuditLog Routes
router.get('/', auditLogController.findAll);
router.get('/:id', auditLogController.findOne);

// ✅ Silme işlemleri (sadece admin)
router.delete('/:id', authorize(ROLES.ADMIN), auditLogController.remove);
router.post('/bulk-delete', authorize(ROLES.ADMIN), auditLogController.removeMany);
router.delete('/clean-old', authorize(ROLES.ADMIN), auditLogController.cleanOldLogs);

export { router as auditLogRoutes };
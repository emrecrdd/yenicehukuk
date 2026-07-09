import express from 'express';
import { auditLogController } from './audit-log.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// ✅ Tüm route'lar için kimlik doğrulama
router.use(authenticate);

// 📌 AuditLog Routes
router.get('/', auditLogController.findAll);
router.get('/:id', auditLogController.findOne);

export { router as auditLogRoutes };
// 📁 server/src/modules/tasks/task.routes.js
import express from 'express';
import { taskController } from './task.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

router.use(authenticate);

// =============================================
// CRUD
// =============================================
router.post('/', authorize(ROLES.ADMIN, ROLES.LAWYER), taskController.create);
router.get('/', taskController.findAll);
router.get('/statistics', taskController.getStatistics);
router.get('/:id', taskController.findOne);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER), taskController.update);
router.delete('/:id', authorize(ROLES.ADMIN), taskController.delete);

// =============================================
// ATAMA
// =============================================
router.patch('/:id/assign', authorize(ROLES.ADMIN, ROLES.LAWYER), taskController.assign);
router.patch('/:id/reassign', authorize(ROLES.ADMIN, ROLES.LAWYER), taskController.reassign);

// =============================================
// KABUL / RED
// =============================================
router.patch('/:id/accept', taskController.accept);
router.patch('/:id/reject', taskController.reject);

// =============================================
// İLERLEME
// =============================================
router.patch('/:id/complete', taskController.complete);
router.patch('/:id/progress', taskController.updateProgress);

export { router as taskRoutes };
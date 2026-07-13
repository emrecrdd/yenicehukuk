import express from 'express';
import { taskController } from './task.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

router.use(authenticate);

// My tasks
router.get('/my', taskController.getMyTasks);
router.get('/my/overdue', taskController.getOverdue);
router.get('/my/upcoming', taskController.getUpcoming);

// Main CRUD
router.post('/', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY), taskController.create);
router.get('/', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), taskController.findAll);
router.get('/statistics', authorize(ROLES.ADMIN, ROLES.LAWYER), taskController.getStatistics);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), taskController.findOne);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY), taskController.update);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER), taskController.remove);

// Status and assignment
router.patch('/:id/status', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY), taskController.updateStatus);
router.patch('/:id/assign', authorize(ROLES.ADMIN, ROLES.LAWYER), taskController.assignTask);

// ✅ YENİ: Süre Takibi (atanan kişi)
router.post('/:id/start', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), taskController.startTask);
router.post('/:id/complete', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), taskController.completeTask);
router.patch('/:id/progress', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), taskController.updateProgress);

// ✅ YENİ: Onay (sadece admin)
router.post('/:id/approve', authorize(ROLES.ADMIN), taskController.approveTask);

// ✅ YENİ: Notlar
router.post('/:id/notes', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), taskController.addNote);
router.get('/:id/notes', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), taskController.getNotes);

export { router as taskRoutes };
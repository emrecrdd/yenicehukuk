import express from 'express';
import { taskController } from './task.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

router.use(authenticate);

// ============ MY TASKS ============
router.get('/my', taskController.getMyTasks);
router.get('/my/overdue', taskController.getOverdue);
router.get('/my/upcoming', taskController.getUpcoming);

// ============ MAIN CRUD ============
router.post('/', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY), taskController.create);
router.get('/', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), taskController.findAll);
router.get('/statistics', authorize(ROLES.ADMIN, ROLES.LAWYER), taskController.getStatistics);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), taskController.findOne);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY), taskController.update);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER), taskController.remove);

// ============ STATUS & ASSIGNMENT ============
router.patch('/:id/status', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY), taskController.updateStatus);
router.patch('/:id/assign', authorize(ROLES.ADMIN, ROLES.LAWYER), taskController.assignTask);

// ============ PROGRESS ============
router.patch('/:id/progress', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY, ROLES.INTERN), taskController.updateProgress);

// ============ TAGS ============
router.patch('/:id/tags', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY, ROLES.INTERN), taskController.updateTags);

// ============ REMINDER ============
router.patch('/:id/reminder', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY, ROLES.INTERN), taskController.updateReminder);

// ============ SUBTASKS ============
router.post('/:id/subtasks', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY, ROLES.INTERN), taskController.addSubtask);
router.delete('/:id/subtasks/:subtaskId', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY, ROLES.INTERN), taskController.deleteSubtask);

export { router as taskRoutes };
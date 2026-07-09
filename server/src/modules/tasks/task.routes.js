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

export { router as taskRoutes };
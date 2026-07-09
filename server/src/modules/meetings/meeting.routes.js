import express from 'express';
import { meetingController } from './meeting.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

router.use(authenticate);

// ✅ Özel route'lar (önce gelmeli)
router.get('/my', meetingController.getMyMeetings);
router.get('/upcoming', meetingController.getUpcoming);
router.get('/case/:caseId', meetingController.getByCase);
router.get('/client/:clientId', meetingController.getByClient);

// ✅ Ana CRUD
router.post('/', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY), meetingController.create);
router.get('/', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), meetingController.findAll);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY), meetingController.findOne);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY), meetingController.update);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.LAWYER), meetingController.remove);
router.patch('/:id/status', authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY), meetingController.updateStatus);

export { router as meetingRoutes };
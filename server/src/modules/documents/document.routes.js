import express from 'express';
import { documentController } from './document.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

router.use(authenticate);

// ✅ Upload single file
router.post(
  '/upload',
  authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY),
  upload.single('file'),
  documentController.upload
);

// ✅ Upload multiple files (max 10)
router.post(
  '/upload-multiple',
  authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY),
  upload.array('files', 10),
  documentController.uploadMultiple
);

// List and filters
router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY),
  documentController.findAll
);

router.get(
  '/categories',
  authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY),
  documentController.getCategories
);

router.get(
  '/statistics',
  authorize(ROLES.ADMIN, ROLES.LAWYER),
  documentController.getStatistics
);

// Single document operations
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY),
  documentController.findOne
);

router.get(
  '/:id/download',
  authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY),
  documentController.download
);

router.get(
  '/:id/preview',
  authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY),
  documentController.preview
);

router.get(
  '/:id/versions',
  authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.INTERN, ROLES.SECRETARY),
  documentController.getVersions
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.LAWYER, ROLES.SECRETARY),
  documentController.update
);

router.delete(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.LAWYER),
  documentController.remove
);

export { router as documentRoutes };
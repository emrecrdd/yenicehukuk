import express from 'express';
import { aiController } from './ai.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.use(authenticate);

// Document analysis
router.post('/analyze-document', authorize(ROLES.ADMIN, ROLES.LAWYER), upload.single('file'), aiController.analyzeDocument);
router.post('/classify-document', authorize(ROLES.ADMIN, ROLES.LAWYER), upload.single('file'), aiController.classifyDocument);

// Case analysis
router.get('/summarize-case/:caseId', authorize(ROLES.ADMIN, ROLES.LAWYER), aiController.summarizeCase);
router.get('/case-recommendations/:caseId', authorize(ROLES.ADMIN, ROLES.LAWYER), aiController.getCaseRecommendations);

// Text analysis
router.post('/legal-advice', authorize(ROLES.ADMIN, ROLES.LAWYER), aiController.generateLegalAdvice);
router.post('/extract-entities', authorize(ROLES.ADMIN, ROLES.LAWYER), aiController.extractEntities);
router.post('/analyze-sentiment', authorize(ROLES.ADMIN, ROLES.LAWYER), aiController.analyzeSentiment);

// Draft generation
router.post('/generate-draft', authorize(ROLES.ADMIN, ROLES.LAWYER), aiController.generateDraft);

export { router as aiRoutes };
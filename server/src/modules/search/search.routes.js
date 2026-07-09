import express from 'express';
import { searchController } from './search.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Tüm search route'ları authenticate gerektirir
router.use(authenticate);

router.get('/', searchController.search);
router.get('/all', searchController.searchAll);
router.get('/clients', searchController.searchClients);
router.get('/cases', searchController.searchCases);
router.get('/documents', searchController.searchDocuments);
router.get('/tasks', searchController.searchTasks);
router.get('/suggestions', searchController.getSearchSuggestions);

export { router as searchRoutes };
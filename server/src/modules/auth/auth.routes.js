import express from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authValidation } from './auth.validation.js';

const router = express.Router();

// Public routes
router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);

// Protected routes
router.use(authenticate);
router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);
router.put('/change-password', validate(authValidation.changePassword), authController.changePassword);

export { router as authRoutes };
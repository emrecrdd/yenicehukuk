import { authService } from './auth.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { logger } from '../../config/logger.js';

export const authController = {
  async register(req, res) {
    try {
      const userData = req.body;
      const result = await authService.register(userData);
      return successResponse(res, result, 'User registered successfully', 201);
    } catch (error) {
      logger.error('Register error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return successResponse(res, result, 'Login successful');
    } catch (error) {
      logger.error('Login error:', error);
      return errorResponse(res, error.message, 401);
    }
  },

  async logout(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      await authService.logout(refreshToken);
      
      res.clearCookie('refreshToken');
      return successResponse(res, null, 'Logout successful');
    } catch (error) {
      logger.error('Logout error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      const result = await authService.refreshToken(refreshToken);
      
      // Update refresh token cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, result, 'Token refreshed successfully');
    } catch (error) {
      logger.error('Refresh token error:', error);
      return errorResponse(res, error.message, 401);
    }
  },

  async getProfile(req, res) {
    try {
      const user = await authService.getProfile(req.user.id);
      return successResponse(res, user, 'Profile fetched successfully');
    } catch (error) {
      logger.error('Get profile error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, currentPassword, newPassword);
      return successResponse(res, null, 'Password changed successfully');
    } catch (error) {
      logger.error('Change password error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      return successResponse(res, null, 'Password reset email sent');
    } catch (error) {
      logger.error('Forgot password error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      return successResponse(res, null, 'Password reset successfully');
    } catch (error) {
      logger.error('Reset password error:', error);
      return errorResponse(res, error.message, 400);
    }
  },
};
// 📁 server/src/modules/tasks/task.controller.js
import { taskService } from './task.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';
import { logger } from '../../config/logger.js';

export const taskController = {
  // =============================================
  // CREATE
  // =============================================
  async create(req, res) {
    try {
      const taskData = { ...req.body, created_by: req.user.id };
      const task = await taskService.create(taskData);
      return successResponse(res, task, 'Görev oluşturuldu', 201);
    } catch (error) {
      logger.error('Create task error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // =============================================
  // ASSIGN
  // =============================================
  async assign(req, res) {
    try {
      const { id } = req.params;
      const { assigned_to } = req.body;
      const task = await taskService.assign(id, assigned_to, req.user.id);
      return successResponse(res, task, 'Görev atandı');
    } catch (error) {
      logger.error('Assign task error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // =============================================
  // ACCEPT (KABUL ET)
  // =============================================
  async accept(req, res) {
    try {
      const { id } = req.params;
      const task = await taskService.accept(id, req.user.id);
      return successResponse(res, task, 'Görev kabul edildi');
    } catch (error) {
      logger.error('Accept task error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // =============================================
  // REJECT (REDDET)
  // =============================================
  async reject(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason || reason.trim() === '') {
        return errorResponse(res, 'Reddetme sebebi belirtmelisiniz', 400);
      }

      const task = await taskService.reject(id, req.user.id, reason);
      return successResponse(res, task, 'Görev reddedildi');
    } catch (error) {
      logger.error('Reject task error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // =============================================
  // REASSIGN (YENİDEN ATA)
  // =============================================
  async reassign(req, res) {
    try {
      const { id } = req.params;
      const { assigned_to } = req.body;
      const task = await taskService.reassign(id, assigned_to, req.user.id);
      return successResponse(res, task, 'Görev yeniden atandı');
    } catch (error) {
      logger.error('Reassign task error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // =============================================
  // COMPLETE (TAMAMLA)
  // =============================================
  async complete(req, res) {
    try {
      const { id } = req.params;
      const task = await taskService.complete(id, req.user.id);
      return successResponse(res, task, 'Görev tamamlandı');
    } catch (error) {
      logger.error('Complete task error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // =============================================
  // UPDATE PROGRESS
  // =============================================
  async updateProgress(req, res) {
    try {
      const { id } = req.params;
      const { progress } = req.body;

      if (progress === undefined || progress === null) {
        return errorResponse(res, 'Progress değeri gereklidir', 400);
      }

      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return errorResponse(res, 'Progress 0-100 arasında olmalıdır', 400);
      }

      const task = await taskService.updateProgress(id, req.user.id, progress);
      return successResponse(res, task, 'İlerleme güncellendi');
    } catch (error) {
      logger.error('Update progress error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // =============================================
  // FIND ONE
  // =============================================
  async findOne(req, res) {
    try {
      const { id } = req.params;
      const task = await taskService.findOne(id, req.user.id);
      return successResponse(res, task, 'Görev getirildi');
    } catch (error) {
      logger.error('Get task error:', error);
      return errorResponse(res, error.message, error.message === 'Task not found' ? 404 : 400);
    }
  },

  // =============================================
  // FIND ALL
  // =============================================
  async findAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        priority,
        assigned_to,
        case_id,
        client_id,
        due_date_from,
        due_date_to,
        sort_by,
        sort_order,
      } = req.query;

      const result = await taskService.findAll(
        {
          page,
          limit,
          search,
          status,
          priority,
          assigned_to,
          case_id,
          client_id,
          due_date_from,
          due_date_to,
          sort_by,
          sort_order,
        },
        req.user.id,
        req.user.role
      );

      return paginatedResponse(res, result.data, result.pagination, 'Görevler getirildi');
    } catch (error) {
      logger.error('Get tasks error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // =============================================
  // STATISTICS
  // =============================================
  async getStatistics(req, res) {
    try {
      const stats = await taskService.getStatistics(req.user.id, req.user.role);
      return successResponse(res, stats, 'İstatistikler getirildi');
    } catch (error) {
      logger.error('Get statistics error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // =============================================
  // UPDATE
  // =============================================
  async update(req, res) {
    try {
      const { id } = req.params;
      const task = await taskService.update(id, req.body, req.user.id);
      return successResponse(res, task, 'Görev güncellendi');
    } catch (error) {
      logger.error('Update task error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // =============================================
  // DELETE
  // =============================================
  async delete(req, res) {
    try {
      const { id } = req.params;
      await taskService.delete(id, req.user.id);
      return successResponse(res, null, 'Görev silindi');
    } catch (error) {
      logger.error('Delete task error:', error);
      return errorResponse(res, error.message, 400);
    }
  },
};
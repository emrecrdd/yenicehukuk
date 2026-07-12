import { taskService } from './task.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';
import { logger } from '../../config/logger.js';
import { AuditLog } from '../../models/AuditLog.js';

export const taskController = {
  async create(req, res) {
    try {
      const taskData = { ...req.body, created_by: req.user.id };
      const task = await taskService.create(taskData);

      await AuditLog.create({
        action: 'create',
        entity_type: 'task',
        entity_id: task.id,
        user_id: req.user.id,
        description: `"${task.title}" görevi oluşturuldu`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, task, 'Task created successfully', 201);
    } catch (error) {
      logger.error('Create task error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async findAll(req, res) {
    try {
      const { page = 1, limit = 10, search, status, priority, assigned_to, case_id } = req.query;
      const result = await taskService.findAll({ page, limit, search, status, priority, assigned_to, case_id });
      return paginatedResponse(res, result.data, result.pagination, 'Tasks fetched successfully');
    } catch (error) {
      logger.error('Get tasks error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ✅ DÜZELTİLMİŞ findOne
  async findOne(req, res) {
    try {
      const { id } = req.params;
      
      console.log(`🔍 Task aranıyor: ${id}`);
      
      // Önce task'ı bul
      const task = await taskService.findOne(id);
      
      // Task bulunamadıysa 404 döndür
      if (!task) {
        console.log(`❌ Task bulunamadı: ${id}`);
        return errorResponse(res, 'Task bulunamadı', 404);
      }
      
      console.log(`✅ Task bulundu: ${task.id}`);
      return successResponse(res, task, 'Task fetched successfully');
      
    } catch (error) {
      console.error('Get task error:', error);
      
      // Hata mesajını kontrol et
      if (error.message === 'Task not found' || error.message.includes('bulunamadı')) {
        return errorResponse(res, 'Task bulunamadı', 404);
      }
      
      return errorResponse(res, error.message, 404);
    }
  },

  async update(req, res) {
    try {
      const task = await taskService.update(req.params.id, req.body);

      await AuditLog.create({
        action: 'update',
        entity_type: 'task',
        entity_id: task.id,
        user_id: req.user.id,
        description: `"${task.title}" görevi güncellendi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, task, 'Task updated successfully');
    } catch (error) {
      logger.error('Update task error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async remove(req, res) {
    try {
      const task = await taskService.findOne(req.params.id);
      await taskService.remove(req.params.id);

      await AuditLog.create({
        action: 'delete',
        entity_type: 'task',
        entity_id: req.params.id,
        user_id: req.user.id,
        description: `"${task.title}" görevi silindi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, null, 'Task deleted successfully');
    } catch (error) {
      logger.error('Delete task error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const task = await taskService.updateStatus(req.params.id, status);

      await AuditLog.create({
        action: 'update',
        entity_type: 'task',
        entity_id: task.id,
        user_id: req.user.id,
        description: `"${task.title}" görev durumu "${status}" olarak güncellendi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, task, 'Task status updated successfully');
    } catch (error) {
      logger.error('Update task status error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async assignTask(req, res) {
    try {
      const { assigned_to } = req.body;
      const task = await taskService.assignTask(req.params.id, assigned_to);

      await AuditLog.create({
        action: 'update',
        entity_type: 'task',
        entity_id: task.id,
        user_id: req.user.id,
        description: `"${task.title}" görevi kullanıcıya atandı`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, task, 'Task assigned successfully');
    } catch (error) {
      logger.error('Assign task error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getMyTasks(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const result = await taskService.getMyTasks(req.user.id, { page, limit, status });
      return paginatedResponse(res, result.data, result.pagination, 'My tasks fetched successfully');
    } catch (error) {
      logger.error('Get my tasks error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getStatistics(req, res) {
    try {
      const stats = await taskService.getStatistics(req.user.id);
      return successResponse(res, stats, 'Task statistics fetched successfully');
    } catch (error) {
      logger.error('Get task statistics error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getOverdue(req, res) {
    try {
      const tasks = await taskService.getOverdue(req.user.id);
      return successResponse(res, tasks, 'Overdue tasks fetched successfully');
    } catch (error) {
      logger.error('Get overdue tasks error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getUpcoming(req, res) {
    try {
      const tasks = await taskService.getUpcoming(req.user.id);
      return successResponse(res, tasks, 'Upcoming tasks fetched successfully');
    } catch (error) {
      logger.error('Get upcoming tasks error:', error);
      return errorResponse(res, error.message, 400);
    }
  },
};
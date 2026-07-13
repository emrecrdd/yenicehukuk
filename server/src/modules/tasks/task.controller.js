import { taskService } from './task.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';
import { logger } from '../../config/logger.js';
import { AuditLog } from '../../models/AuditLog.js';

export const taskController = {
  // ============ CREATE ============
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

  // ============ FIND ALL ============
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

  // ============ FIND ONE ============
  async findOne(req, res) {
    try {
      const { id } = req.params;
      const task = await taskService.findOne(id);
      
      if (!task) {
        return errorResponse(res, 'Task bulunamadı', 404);
      }
      
      return successResponse(res, task, 'Task fetched successfully');
    } catch (error) {
      logger.error('Get task error:', error);
      if (error.message === 'Task not found') {
        return errorResponse(res, 'Task bulunamadı', 404);
      }
      return errorResponse(res, error.message, 404);
    }
  },

  // ============ UPDATE ============
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

  // ============ DELETE ============
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

  // ============ UPDATE STATUS ============
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

  // ============ ASSIGN ============
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

  // ============ MY TASKS ============
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

  // ============ STATISTICS ============
  async getStatistics(req, res) {
    try {
      const stats = await taskService.getStatistics(req.user.id);
      return successResponse(res, stats, 'Task statistics fetched successfully');
    } catch (error) {
      logger.error('Get task statistics error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ============ OVERDUE ============
  async getOverdue(req, res) {
    try {
      const tasks = await taskService.getOverdue(req.user.id);
      return successResponse(res, tasks, 'Overdue tasks fetched successfully');
    } catch (error) {
      logger.error('Get overdue tasks error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ============ UPCOMING ============
  async getUpcoming(req, res) {
    try {
      const tasks = await taskService.getUpcoming(req.user.id);
      return successResponse(res, tasks, 'Upcoming tasks fetched successfully');
    } catch (error) {
      logger.error('Get upcoming tasks error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ============ PROGRESS ============
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

      const task = await taskService.update(id, { progress });

      await AuditLog.create({
        action: 'update',
        entity_type: 'task',
        entity_id: task.id,
        user_id: req.user.id,
        description: `"${task.title}" görev ilerlemesi %${progress} olarak güncellendi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, task, 'Progress güncellendi');
    } catch (error) {
      logger.error('Update progress error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ============ TAGS ============
  async updateTags(req, res) {
    try {
      const { id } = req.params;
      const { tags } = req.body;

      if (!Array.isArray(tags)) {
        return errorResponse(res, 'Tags bir dizi olmalıdır', 400);
      }

      const task = await taskService.update(id, { tags });

      await AuditLog.create({
        action: 'update',
        entity_type: 'task',
        entity_id: task.id,
        user_id: req.user.id,
        description: `"${task.title}" görev etiketleri güncellendi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, task, 'Tags güncellendi');
    } catch (error) {
      logger.error('Update tags error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ============ REMINDER ============
  async updateReminder(req, res) {
    try {
      const { id } = req.params;
      const { reminder_date } = req.body;

      const task = await taskService.update(id, { reminder_date });

      await AuditLog.create({
        action: 'update',
        entity_type: 'task',
        entity_id: task.id,
        user_id: req.user.id,
        description: `"${task.title}" görev hatırlatma tarihi güncellendi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, task, 'Reminder güncellendi');
    } catch (error) {
      logger.error('Update reminder error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ============ ADD SUBTASK ============
  async addSubtask(req, res) {
    try {
      const { id } = req.params;
      const { title, description, status, priority, due_date } = req.body;

      if (!title || title.trim() === '') {
        return errorResponse(res, 'Subtask başlığı gereklidir', 400);
      }

      const subtaskData = {
        title: title.trim(),
        description: description || '',
        status: status || 'pending',
        priority: priority || 'normal',
        due_date: due_date || null,
        parent_task_id: id,
        created_by: req.user.id,
      };

      const subtask = await taskService.create(subtaskData);

      await AuditLog.create({
        action: 'create',
        entity_type: 'task',
        entity_id: subtask.id,
        user_id: req.user.id,
        description: `"${subtask.title}" alt görevi eklendi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, subtask, 'Subtask eklendi', 201);
    } catch (error) {
      logger.error('Add subtask error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ============ DELETE SUBTASK ============
  async deleteSubtask(req, res) {
    try {
      const { id, subtaskId } = req.params;

      const subtask = await taskService.findOne(subtaskId);
      
      if (!subtask) {
        return errorResponse(res, 'Subtask bulunamadı', 404);
      }
      
      if (subtask.parent_task_id !== id) {
        return errorResponse(res, 'Bu task\'a ait bir subtask değil', 403);
      }

      await taskService.remove(subtaskId);

      await AuditLog.create({
        action: 'delete',
        entity_type: 'task',
        entity_id: subtaskId,
        user_id: req.user.id,
        description: `"${subtask.title}" alt görevi silindi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, null, 'Subtask silindi');
    } catch (error) {
      logger.error('Delete subtask error:', error);
      return errorResponse(res, error.message, 400);
    }
  },
};
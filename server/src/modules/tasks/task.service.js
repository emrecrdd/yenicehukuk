// 📁 server/src/modules/tasks/task.service.js
import { Task, User, Case, Client, Notification, AuditLog } from '../../models/index.js';
import { Op } from 'sequelize';
import { paginate, getPaginationData } from '../../utils/paginate.js';

export const taskService = {
  // =============================================
  // 1. CREATE
  // =============================================
  async create(data) {
    const task = await Task.create({
      ...data,
      status: data.assigned_to ? 'pending' : 'draft',
    });

    if (data.assigned_to) {
      await this.assign(task.id, data.assigned_to, data.created_by);
    }

    return task;
  },

  // =============================================
  // 2. ASSIGN (ATA)
  // =============================================
  async assign(taskId, userId, assignedBy) {
    const task = await Task.findByPk(taskId);
    if (!task) throw new Error('Task not found');

    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    await task.update({
      assigned_to: userId,
      assigned_by: assignedBy,
      assigned_at: new Date(),
      status: 'pending',
    });

    await Notification.create({
      user_id: userId,
      type: 'task_assigned',
      title: '📋 Yeni Görev Atandı',
      message: `"${task.title}" görevi size atandı.`,
      data: { taskId: task.id },
      action_url: `/tasks/${task.id}`,
    });

    await Notification.create({
      user_id: assignedBy,
      type: 'task_assigned_success',
      title: '✅ Görev Atandı',
      message: `"${task.title}" görevi ${user.first_name} ${user.last_name}'a atandı.`,
      data: { taskId: task.id },
      action_url: `/tasks/${task.id}`,
    });

    return task;
  },

  // =============================================
  // 3. ACCEPT (KABUL ET)
  // =============================================
  async accept(taskId, userId) {
    const task = await Task.findByPk(taskId);
    if (!task) throw new Error('Task not found');

    if (task.assigned_to !== userId) {
      throw new Error('Bu görev size atanmamış');
    }

    if (task.status === 'accepted') {
      throw new Error('Görev zaten kabul edilmiş');
    }

    if (task.status === 'rejected') {
      throw new Error('Reddedilmiş görev kabul edilemez');
    }

    await task.update({
      status: 'accepted',
      accepted_at: new Date(),
      start_date: new Date(),
    });

    await Notification.create({
      user_id: task.assigned_by,
      type: 'task_accepted',
      title: '✅ Görev Kabul Edildi',
      message: `"${task.title}" görevi kabul edildi.`,
      data: { taskId: task.id },
      action_url: `/tasks/${task.id}`,
    });

    return task;
  },

  // =============================================
  // 4. REJECT (REDDET)
  // =============================================
  async reject(taskId, userId, reason) {
    const task = await Task.findByPk(taskId);
    if (!task) throw new Error('Task not found');

    if (task.assigned_to !== userId) {
      throw new Error('Bu görev size atanmamış');
    }

    if (!reason || reason.trim() === '') {
      throw new Error('Reddetme sebebi belirtmelisiniz');
    }

    await task.update({
      status: 'rejected',
      rejected_at: new Date(),
      rejection_reason: reason,
    });

    await Notification.create({
      user_id: task.assigned_by,
      type: 'task_rejected',
      title: '❌ Görev Reddedildi',
      message: `"${task.title}" görevi reddedildi. Sebep: ${reason}`,
      data: { taskId: task.id },
      action_url: `/tasks/${task.id}`,
    });

    return task;
  },

  // =============================================
  // 5. REASSIGN (YENİDEN ATA)
  // =============================================
  async reassign(taskId, userId, assignedBy) {
    const task = await Task.findByPk(taskId);
    if (!task) throw new Error('Task not found');

    if (task.status !== 'rejected' && task.status !== 'pending') {
      throw new Error('Sadece reddedilmiş veya bekleyen görevler yeniden atanabilir');
    }

    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    await task.update({
      assigned_to: userId,
      assigned_by: assignedBy,
      assigned_at: new Date(),
      status: 'pending',
      rejected_at: null,
      rejection_reason: null,
    });

    await Notification.create({
      user_id: userId,
      type: 'task_reassigned',
      title: '🔄 Görev Yeniden Atandı',
      message: `"${task.title}" görevi size yeniden atandı.`,
      data: { taskId: task.id },
      action_url: `/tasks/${task.id}`,
    });

    return task;
  },

  // =============================================
  // 6. COMPLETE (TAMAMLA)
  // =============================================
  async complete(taskId, userId) {
    const task = await Task.findByPk(taskId);
    if (!task) throw new Error('Task not found');

    const isAssignee = task.assigned_to === userId;
    const isAdmin = userId === task.assigned_by || userId === task.created_by;

    if (!isAssignee && !isAdmin) {
      throw new Error('Bu görevi tamamlama yetkiniz yok');
    }

    if (task.status === 'completed') {
      throw new Error('Görev zaten tamamlanmış');
    }

    await task.update({
      status: 'completed',
      completed_at: new Date(),
      progress: 100,
    });

    await Notification.create({
      user_id: task.assigned_by || task.created_by,
      type: 'task_completed',
      title: '🎉 Görev Tamamlandı',
      message: `"${task.title}" görevi tamamlandı.`,
      data: { taskId: task.id },
      action_url: `/tasks/${task.id}`,
    });

    return task;
  },

  // =============================================
  // 7. UPDATE PROGRESS
  // =============================================
  async updateProgress(taskId, userId, progress) {
    if (progress < 0 || progress > 100) {
      throw new Error('İlerleme 0-100 arasında olmalıdır');
    }

    const task = await Task.findByPk(taskId);
    if (!task) throw new Error('Task not found');

    const isAssignee = task.assigned_to === userId;
    const isAdmin = userId === task.assigned_by || userId === task.created_by;

    if (!isAssignee && !isAdmin) {
      throw new Error('İlerleme güncelleme yetkiniz yok');
    }

    await task.update({ progress });
    return task;
  },

  // =============================================
  // 8. FIND ONE
  // =============================================
  async findOne(taskId, userId) {
    const task = await Task.findByPk(taskId, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: User, as: 'assigner', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: Case, as: 'case', attributes: ['id', 'title', 'case_number'] },
        { model: Client, as: 'client', attributes: ['id', 'name'] },
        {
          model: Task,
          as: 'subtasks',
          attributes: ['id', 'title', 'status', 'due_date', 'progress'],
        },
      ],
    });

    if (!task) throw new Error('Task not found');

    const isAuthorized =
      task.assigned_to === userId ||
      task.assigned_by === userId ||
      task.created_by === userId;

    if (!isAuthorized) {
      throw new Error('Bu görevi görme yetkiniz yok');
    }

    return task;
  },

  // =============================================
  // 9. FIND ALL
  // =============================================
  async findAll(filters, userId, role) {
    const where = {};

    if (role !== 'admin') {
      where[Op.or] = [
        { assigned_to: userId },
        { assigned_by: userId },
        { created_by: userId },
      ];
    }

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigned_to) where.assigned_to = filters.assigned_to;
    if (filters.case_id) where.case_id = filters.case_id;
    if (filters.client_id) where.client_id = filters.client_id;
    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    if (filters.due_date_from) {
      where.due_date = { [Op.gte]: new Date(filters.due_date_from) };
    }
    if (filters.due_date_to) {
      where.due_date = { [Op.lte]: new Date(filters.due_date_to) };
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;

    const order = [];
    if (filters.sort_by) {
      order.push([filters.sort_by, filters.sort_order || 'DESC']);
    } else {
      order.push(['priority', 'DESC']);
      order.push(['due_date', 'ASC']);
      order.push(['created_at', 'DESC']);
    }

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name'] },
        { model: User, as: 'assigner', attributes: ['id', 'first_name', 'last_name'] },
        { model: Case, as: 'case', attributes: ['id', 'title'] },
        { model: Client, as: 'client', attributes: ['id', 'name'] },
      ],
      order,
      limit,
      offset,
      distinct: true,
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  // =============================================
  // 10. STATISTICS
  // =============================================
  async getStatistics(userId, role) {
    const where = {};
    if (role !== 'admin') {
      where[Op.or] = [
        { assigned_to: userId },
        { assigned_by: userId },
        { created_by: userId },
      ];
    }

    const tasks = await Task.findAll({ where });

    return {
      total: tasks.length,
      draft: tasks.filter((t) => t.status === 'draft').length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      accepted: tasks.filter((t) => t.status === 'accepted').length,
      rejected: tasks.filter((t) => t.status === 'rejected').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      review: tasks.filter((t) => t.status === 'review').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      cancelled: tasks.filter((t) => t.status === 'cancelled').length,
      archived: tasks.filter((t) => t.status === 'archived').length,
      overdue: tasks.filter(
        (t) =>
          t.due_date &&
          new Date(t.due_date) < new Date() &&
          !['completed', 'cancelled', 'archived'].includes(t.status)
      ).length,
      priority: {
        low: tasks.filter((t) => t.priority === 'low').length,
        medium: tasks.filter((t) => t.priority === 'medium').length,
        high: tasks.filter((t) => t.priority === 'high').length,
        critical: tasks.filter((t) => t.priority === 'critical').length,
      },
      completionRate: tasks.length
        ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)
        : 0,
    };
  },

  // =============================================
  // 11. UPDATE
  // =============================================
  async update(taskId, data, userId) {
    const task = await Task.findByPk(taskId);
    if (!task) throw new Error('Task not found');

    const isAdmin = userId === task.assigned_by || userId === task.created_by;
    if (!isAdmin) {
      throw new Error('Bu görevi güncelleme yetkiniz yok');
    }

    await task.update(data);
    return task;
  },

  // =============================================
  // 12. DELETE
  // =============================================
  async delete(taskId, userId) {
    const task = await Task.findByPk(taskId);
    if (!task) throw new Error('Task not found');

    if (task.created_by !== userId) {
      throw new Error('Sadece görevi oluşturan kişi silebilir');
    }

    await task.destroy();
    return task;
  },
};
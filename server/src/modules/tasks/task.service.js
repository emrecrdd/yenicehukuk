import { Task } from '../../models/Task.js';
import { User } from '../../models/User.js';
import { Case } from '../../models/Case.js';
import { Client } from '../../models/Client.js';
import { Op } from 'sequelize';
import { paginate, getPaginationData } from '../../utils/paginate.js';
import { notificationService } from '../notifications/notification.service.js';

export const taskService = {
  async create(data) {
    const task = await Task.create(data);

    // ✅ Görev oluşturulduğunda atanan kişiye bildirim gönder
    if (task.assigned_to) {
      const creator = await User.findByPk(data.created_by);
      const creatorName = creator ? `${creator.first_name} ${creator.last_name}` : 'Sistem';
      
      await notificationService.notifyTaskAssigned(
        task.assigned_to,
        task.id,
        task.title,
        creatorName
      );
    }

    return task;
  },

  async findAll({ page, limit, search, status, priority, assigned_to, case_id }) {
    const where = {};

    if (search && search.trim() !== '') {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assigned_to) {
      where.assigned_to = assigned_to;
    }

    if (case_id) {
      where.case_id = case_id;
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const query = paginate({ where }, pageNum, limitNum);
    const { count, rows } = await Task.findAndCountAll({
      ...query,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [
        ['priority', 'DESC'],
        ['due_date', 'ASC'],
        ['created_at', 'DESC'],
      ],
    });

    const pagination = getPaginationData(count, pageNum, limitNum);

    return {
      data: rows,
      pagination,
    };
  },

  async findOne(id) {
    console.log('🔍 findOne çağrıldı. ID:', id);
    
    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
          include: [
            {
              model: Client,
              as: 'client',
              attributes: ['id', 'first_name', 'last_name'],
            },
          ],
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: Task,
          as: 'parentTask',
          attributes: ['id', 'title', 'status'],
        },
        {
          model: Task,
          as: 'subtasks',
          attributes: ['id', 'title', 'status', 'due_date'],
        },
      ],
    });

    console.log('📄 Task bulundu:', task?.id);
    console.log('👤 assignee:', task?.assignee?.first_name, task?.assignee?.last_name);
    console.log('👤 creator:', task?.creator?.first_name, task?.creator?.last_name);
    console.log('📅 due_date:', task?.due_date);

    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  },

  async update(id, data) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new Error('Task not found');
    }

    await task.update(data);
    return task;
  },

  async remove(id) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new Error('Task not found');
    }

    await task.destroy();
    return task;
  },

  async updateStatus(id, status) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new Error('Task not found');
    }

    const updateData = { status };
    if (status === 'completed') {
      updateData.completed_at = new Date();
    }

    await task.update(updateData);
    return task;
  },

  // ✅ GÜNCELLENDİ: Görev atama + bildirim
  async assignTask(id, assigned_to, assignedBy = null) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new Error('Task not found');
    }

    const user = await User.findByPk(assigned_to);
    if (!user) {
      throw new Error('User not found');
    }

    const oldAssignee = task.assigned_to;
    await task.update({ assigned_to });

    // ✅ Eğer farklı bir kişiye atandıysa bildirim gönder
    if (oldAssignee !== assigned_to) {
      const assignerName = assignedBy || 'Sistem';
      await notificationService.notifyTaskAssigned(
        assigned_to,
        task.id,
        task.title,
        assignerName
      );
    }

    return task;
  },

  async getMyTasks(userId, { page, limit, status }) {
    const where = {
      assigned_to: userId,
    };

    if (status) {
      where.status = status;
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const query = paginate({ where }, pageNum, limitNum);
    const { count, rows } = await Task.findAndCountAll({
      ...query,
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [
        ['priority', 'DESC'],
        ['due_date', 'ASC'],
      ],
    });

    const pagination = getPaginationData(count, pageNum, limitNum);

    return {
      data: rows,
      pagination,
    };
  },

  async getStatistics(userId) {
    const totalTasks = await Task.count();
    const pendingTasks = await Task.count({ where: { status: 'pending' } });
    const inProgressTasks = await Task.count({ where: { status: 'in_progress' } });
    const completedTasks = await Task.count({ where: { status: 'completed' } });
    const overdueTasks = await Task.count({
      where: {
        due_date: { [Op.lt]: new Date() },
        status: { [Op.notIn]: ['completed', 'cancelled'] },
      },
    });

    const myTasks = await Task.count({ where: { assigned_to: userId } });
    const myPending = await Task.count({
      where: { assigned_to: userId, status: 'pending' },
    });
    const myInProgress = await Task.count({
      where: { assigned_to: userId, status: 'in_progress' },
    });
    const myCompleted = await Task.count({
      where: { assigned_to: userId, status: 'completed' },
    });

    return {
      total: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        overdue: overdueTasks,
      },
      my: {
        total: myTasks,
        pending: myPending,
        inProgress: myInProgress,
        completed: myCompleted,
      },
    };
  },

  async getOverdue(userId) {
    return Task.findAll({
      where: {
        assigned_to: userId,
        due_date: { [Op.lt]: new Date() },
        status: { [Op.notIn]: ['completed', 'cancelled'] },
      },
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
        },
      ],
      order: [['due_date', 'ASC']],
    });
  },

  async getUpcoming(userId) {
    const now = new Date();
    const weekLater = new Date(now);
    weekLater.setDate(weekLater.getDate() + 7);

    return Task.findAll({
      where: {
        assigned_to: userId,
        due_date: { [Op.between]: [now, weekLater] },
        status: { [Op.notIn]: ['completed', 'cancelled'] },
      },
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
        },
      ],
      order: [['due_date', 'ASC']],
    });
  },
};
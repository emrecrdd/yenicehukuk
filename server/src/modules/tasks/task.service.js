import { Task } from '../../models/Task.js';
import { User } from '../../models/User.js';
import { Case } from '../../models/Case.js';
import { Client } from '../../models/Client.js';
import { Op } from 'sequelize';
import { paginate, getPaginationData } from '../../utils/paginate.js';
import { notificationService } from '../notifications/notification.service.js';

export const taskService = {
  async create(data) {
    console.log('📝 Create data:', data);
    console.log('👤 assigned_to:', data.assigned_to);
    
    const task = await Task.create(data);

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

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigned_to) where.assigned_to = assigned_to;
    if (case_id) where.case_id = case_id;

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
          attributes: ['id', 'name'],
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

  // ✅ DÜZELTİLMİŞ findOne - assignee_id → assigned_to
  async findOne(id) {
    console.log('🔍 findOne çağrıldı. ID:', id);
    
    try {
      const task = await Task.findByPk(id);
      
      if (!task) {
        console.log('❌ Task bulunamadı:', id);
        throw new Error('Task not found');
      }

      console.log('✅ Task bulundu:', task.id);
      console.log('👤 assigned_to:', task.assigned_to);

      // ✅ DÜZELTİLDİ: assignee_id → assigned_to
      const [assignee, creator, caseData, client, parentTask, subtasks] = await Promise.all([
        User.findByPk(task.assigned_to, {
          attributes: ['id', 'first_name', 'last_name', 'email']
        }),
        User.findByPk(task.created_by, {
          attributes: ['id', 'first_name', 'last_name', 'email']
        }),
        Case.findByPk(task.case_id, {
          attributes: ['id', 'title', 'case_number']
        }),
        Client.findByPk(task.client_id, {
          attributes: ['id', 'name', 'email', 'phone']
        }),
        Task.findByPk(task.parent_task_id, {
          attributes: ['id', 'title', 'status']
        }),
        Task.findAll({
          where: { parent_task_id: task.id },
          attributes: ['id', 'title', 'status', 'due_date']
        })
      ]);

      let caseClient = null;
      if (caseData && caseData.client_id) {
        caseClient = await Client.findByPk(caseData.client_id, {
          attributes: ['id', 'name']
        });
      }

      const enrichedTask = {
        ...task.toJSON(),
        assignee: assignee || null,
        creator: creator || null,
        case: caseData ? {
          ...caseData.toJSON(),
          client: caseClient
        } : null,
        client: client || null,
        parentTask: parentTask || null,
        subtasks: subtasks || []
      };

      console.log('📄 Task zenginleştirildi:', enrichedTask.id);
      console.log('👤 assignee:', enrichedTask.assignee?.first_name, enrichedTask.assignee?.last_name);
      console.log('👤 creator:', enrichedTask.creator?.first_name, enrichedTask.creator?.last_name);
      console.log('📅 due_date:', enrichedTask.due_date);

      return enrichedTask;

    } catch (error) {
      console.error('❌ findOne hatası:', error);
      throw error;
    }
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

    if (status) where.status = status;

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
          attributes: ['id', 'name'],
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
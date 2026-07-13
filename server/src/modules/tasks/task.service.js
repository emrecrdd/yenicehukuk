import { Task } from '../../models/Task.js';
import { Note } from '../../models/Note.js';
import { User } from '../../models/User.js';
import { Case } from '../../models/Case.js';
import { Client } from '../../models/Client.js';
import { Op } from 'sequelize';
import { paginate, getPaginationData } from '../../utils/paginate.js';
import { notificationService } from '../notifications/notification.service.js';

export const taskService = {
  async create(data) {
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
          as: 'clients',
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

  async findOne(id) {
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
              as: 'clients',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: Client,
          as: 'clients',
          attributes: ['id', 'name'],
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
        {
          model: Note,
          as: 'taskNotes',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'first_name', 'last_name', 'email'],
            },
          ],
          order: [['created_at', 'ASC']],
        },
      ],
    });

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
          as: 'clients',
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

  // ✅ YENİ: Görevi Başlat
  async startTask(id, userId) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.assigned_to !== userId) {
      throw new Error('You are not assigned to this task');
    }

    if (task.status === 'completed') {
      throw new Error('Task already completed');
    }

    if (task.status === 'in_progress') {
      throw new Error('Task already started');
    }

    await task.update({
      status: 'in_progress',
      started_at: new Date(),
    });

    // Otomatik not ekle
    await Note.create({
      task_id: id,
      created_by: userId,
      content: `Görev başlatıldı: ${task.title}`,
      note_type: 'task',
    });

    return task;
  },

  // ✅ YENİ: Görevi Tamamla (not zorunlu)
  async completeTask(id, userId, { note, actual_hours }) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.assigned_to !== userId) {
      throw new Error('You are not assigned to this task');
    }

    if (task.status === 'completed') {
      throw new Error('Task already completed');
    }

    if (task.status !== 'in_progress') {
      throw new Error('Task must be started first');
    }

    if (!note || note.trim() === '') {
      throw new Error('Completion note is required');
    }

    let actualHours = actual_hours;
    if (!actualHours && task.started_at) {
      const diffMs = new Date() - new Date(task.started_at);
      actualHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    await task.update({
      status: 'completed',
      completed_at: new Date(),
      actual_hours: actualHours,
      progress: 100,
    });

    await Note.create({
      task_id: id,
      created_by: userId,
      content: note,
      note_type: 'task',
    });

    // Admin'e bildirim gönder
    if (task.created_by) {
      await notificationService.notifyTaskCompleted(
        task.created_by,
        task.id,
        task.title,
        userId
      );
    }

    return task;
  },

  // ✅ YENİ: Görevi Onayla (sadece admin)
  async approveTask(id, userId) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.status !== 'completed') {
      throw new Error('Only completed tasks can be approved');
    }

    if (task.approved_at) {
      throw new Error('Task already approved');
    }

    await task.update({
      approved_by: userId,
      approved_at: new Date(),
    });

    const approver = await User.findByPk(userId);
    await Note.create({
      task_id: id,
      created_by: userId,
      content: `Görev onaylandı: ${task.title}`,
      note_type: 'task',
    });

    if (task.assigned_to) {
      await notificationService.notifyTaskApproved(
        task.assigned_to,
        task.id,
        task.title,
        approver ? `${approver.first_name} ${approver.last_name}` : 'Admin'
      );
    }

    return task;
  },

  // ✅ YENİ: Not Ekle (sadece atanan kişi)
  async addNote(id, userId, { content }) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.assigned_to !== userId) {
      throw new Error('You are not assigned to this task');
    }

    if (!content || content.trim() === '') {
      throw new Error('Note content is required');
    }

    const note = await Note.create({
      task_id: id,
      created_by: userId,
      content,
      note_type: 'task',
    });

    const noteWithUser = await Note.findByPk(note.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
      ],
    });

    return noteWithUser;
  },

  // ✅ YENİ: Notları Getir
  async getNotes(id, userId) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new Error('Task not found');
    }

    const user = await User.findByPk(userId);
    const isAdmin = user?.role === 'admin';
    
    if (!isAdmin && task.assigned_to !== userId) {
      throw new Error('You do not have permission to view these notes');
    }

    const notes = await Note.findAll({
      where: {
        task_id: id,
        note_type: 'task',
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email', 'role'],
        },
      ],
      order: [['created_at', 'ASC']],
    });

    return notes;
  },

  // ✅ YENİ: İlerleme Güncelle
  async updateProgress(id, userId, progress) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.assigned_to !== userId) {
      throw new Error('You are not assigned to this task');
    }

    if (task.status === 'completed' || task.status === 'cancelled') {
      throw new Error('Cannot update progress of completed/cancelled task');
    }

    const validatedProgress = Math.min(100, Math.max(0, parseInt(progress) || 0));
    
    await task.update({ progress: validatedProgress });

    if (validatedProgress > 0 && validatedProgress % 25 === 0) {
      await Note.create({
        task_id: id,
        created_by: userId,
        content: `Görev ilerlemesi %${validatedProgress} oldu`,
        note_type: 'task',
      });
    }

    return task;
  },
};
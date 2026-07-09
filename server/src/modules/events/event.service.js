import { Event } from '../../models/Event.js';
import { Task } from '../../models/Task.js';
import { Case } from '../../models/Case.js';
import { User } from '../../models/User.js';
import { Op } from 'sequelize';
import { paginate, getPaginationData } from '../../utils/paginate.js';
import { notificationService } from '../notifications/notification.service.js';

export const eventService = {
  // ✅ GÜNCELLENDİ: Duruşma oluştur + bildirim
  async create(data) {
    const event = await Event.create(data);

    // ✅ Duruşma oluşturulduğunda atanan kişiye bildirim gönder
    if (event.event_type === 'hearing' && event.assigned_to) {
      await notificationService.notifyHearingReminder(
        event.assigned_to,
        event.id,
        event.title,
        event.start_date
      );
    }

    return event;
  },

  async findAll({ page, limit, case_id, status }) {
    const where = {};

    if (case_id) {
      where.case_id = case_id;
    }

    if (status) {
      where.status = status;
    }

    const query = paginate({ where }, page, limit);
    const { count, rows } = await Event.findAndCountAll({
      ...query,
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [['start_date', 'ASC']],
    });

    const pagination = getPaginationData(count, page, limit);

    return {
      data: rows,
      pagination,
    };
  },

  async getMyEvents(userId) {
    return Event.findAll({
      where: { assigned_to: userId },
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
        },
      ],
      order: [['start_date', 'ASC']],
    });
  },

  async getByCase(caseId) {
    return Event.findAll({
      where: { case_id: caseId },
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [['start_date', 'ASC']],
    });
  },

  async findOne(id) {
    const event = await Event.findByPk(id, {
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  },

  async update(id, data) {
    const event = await Event.findByPk(id);
    if (!event) {
      throw new Error('Event not found');
    }

    await event.update(data);
    return event;
  },

  async remove(id) {
    const event = await Event.findByPk(id);
    if (!event) {
      throw new Error('Event not found');
    }

    await event.destroy();
    return event;
  },

  // ✅ BURASI YENİ EKLENEN FONKSİYON
  async getCalendarEvents(userId, { year, month }) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // 1. Events (Duruşmalar, toplantılar)
    const events = await Event.findAll({
      where: {
        [Op.or]: [
          { created_by: userId },
          { assigned_to: userId },
        ],
        start_date: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title', 'case_number'],
        },
      ],
      order: [['start_date', 'ASC']],
    });

    // 2. Tasks (Görevler - due_date)
    const tasks = await Task.findAll({
      where: {
        assigned_to: userId,
        due_date: {
          [Op.between]: [startDate, endDate],
        },
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

    // Formatla
    const formattedEvents = events.map(e => ({
      id: e.id,
      title: e.title,
      start: e.start_date,
      end: e.end_date || e.start_date,
      type: 'event',
      event_type: e.event_type,
      status: e.status,
      location: e.location,
      case_id: e.case_id,
      case_title: e.case?.title,
      color: e.event_type === 'hearing' ? '#ef4444' :
             e.event_type === 'meeting' ? '#3b82f6' :
             e.event_type === 'deadline' ? '#f59e0b' :
             e.event_type === 'reminder' ? '#8b5cf6' : '#6b7280',
    }));

    const formattedTasks = tasks.map(t => ({
      id: `task-${t.id}`,
      title: t.title,
      start: t.due_date,
      end: t.due_date,
      type: 'task',
      status: t.status,
      priority: t.priority,
      case_id: t.case_id,
      case_title: t.case?.title,
      color: t.priority === 'critical' ? '#ef4444' :
             t.priority === 'high' ? '#f59e0b' :
             t.priority === 'normal' ? '#3b82f6' : '#6b7280',
    }));

    return [...formattedEvents, ...formattedTasks];
  },
};
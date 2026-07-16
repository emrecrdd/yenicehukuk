import { Meeting } from '../../models/Meeting.js';
import { Case } from '../../models/Case.js';
import { Client } from '../../models/Client.js';
import { User } from '../../models/User.js';
import { Op } from 'sequelize';
import { paginate, getPaginationData } from '../../utils/paginate.js';
import { notificationService } from '../notifications/notification.service.js';

export const meetingService = {
  async create(data) {
  console.log('📥 Frontendden gelen start_date:', data.start_date);
  console.log('📥 Frontendden gelen end_date:', data.end_date);

  const meeting = await Meeting.create(data);

  console.log('💾 Veritabanına kaydedilen start_date:', meeting.start_date);
  console.log('💾 Veritabanına kaydedilen end_date:', meeting.end_date);

  if (meeting.assigned_to) {
    await notificationService.notifyMeetingReminder(
      meeting.assigned_to,
      meeting.id,
      meeting.title,
      meeting.start_date
    );
  }

  return meeting;
},

  async findAll({ page, limit, search, status, meeting_type, case_id, client_id }) {
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) where.status = status;
    if (meeting_type) where.meeting_type = meeting_type;
    if (case_id) where.case_id = case_id;
    if (client_id) where.client_id = client_id;

    const query = paginate({ where, order: [['start_date', 'ASC']] }, page, limit);
    const { count, rows } = await Meeting.findAndCountAll({
      ...query,
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title', 'case_number'],
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name'], // ✅ DEĞİŞTİ
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    const pagination = getPaginationData(count, page, limit);

    return {
      data: rows,
      pagination,
    };
  },

  async findOne(id) {
    const meeting = await Meeting.findByPk(id, {
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title', 'case_number'],
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'phone', 'email'], // ✅ DEĞİŞTİ
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    if (!meeting) {
      throw new Error('Meeting not found');
    }

    return meeting;
  },

  async update(id, data) {
    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    await meeting.update(data);
    return meeting;
  },

  async remove(id) {
    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    await meeting.destroy();
    return meeting;
  },

  async getMyMeetings(userId) {
    return Meeting.findAll({
      where: {
        [Op.or]: [
          { created_by: userId },
          { assigned_to: userId },
        ],
      },
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name'], // ✅ DEĞİŞTİ
        },
      ],
      order: [['start_date', 'ASC']],
    });
  },

  async getByCase(caseId) {
    return Meeting.findAll({
      where: { case_id: caseId },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name'], // ✅ DEĞİŞTİ
        },
      ],
      order: [['start_date', 'ASC']],
    });
  },

  async getByClient(clientId) {
    return Meeting.findAll({
      where: { client_id: clientId },
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

  async getUpcoming(userId, limit = 5) {
    const now = new Date();
    return Meeting.findAll({
      where: {
        [Op.or]: [
          { created_by: userId },
          { assigned_to: userId },
        ],
        start_date: { [Op.gte]: now },
        status: { [Op.notIn]: ['completed', 'cancelled'] },
      },
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
        },
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name'], // ✅ DEĞİŞTİ
        },
      ],
      order: [['start_date', 'ASC']],
      limit,
    });
  },

  async updateStatus(id, status) {
    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    await meeting.update({ status });
    return meeting;
  },
};
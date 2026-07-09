import { Client } from '../../models/Client.js';
import { Case } from '../../models/Case.js';
import { Document } from '../../models/Document.js';
import { Task } from '../../models/Task.js';
import { Event } from '../../models/Event.js';
import { Payment } from '../../models/Payment.js';
import { Op } from 'sequelize';

export const dashboardService = {
  async getStats() {
    const totalClients = await Client.count();
    const activeCases = await Case.count({ where: { status: { [Op.notIn]: ['concluded', 'archived'] } } });
    const totalDocuments = await Document.count();
    const pendingTasks = await Task.count({ where: { status: 'pending' } });

    // Toplam tahsilat
    const totalReceived = await Payment.sum('amount', {
      where: { status: 'completed', payment_type: 'received' },
    }) || 0;

    // Bekleyen ödemeler
    const totalPendingPayments = await Payment.sum('amount', {
      where: { status: 'pending', payment_type: 'received' },
    }) || 0;

    return {
      totalClients,
      activeCases,
      totalDocuments,
      pendingTasks,
      totalReceived,
      totalPendingPayments,
    };
  },

  async getTodayHearings() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const events = await Event.findAll({
      where: {
        start_date: {
          [Op.between]: [today, tomorrow],
        },
        event_type: 'hearing',
      },
      include: [
        {
          model: Case,
          as: 'case',
          include: [
            {
              model: Client,
              as: 'client',
              attributes: ['id', 'first_name', 'last_name'],
            },
          ],
        },
      ],
      order: [['start_date', 'ASC']],
    });

    return events;
  },

  async getUpcomingTasks(userId, limit = 5) {
    const now = new Date();
    const tasks = await Task.findAll({
      where: {
        assigned_to: userId,
        status: { [Op.notIn]: ['completed', 'cancelled'] },
        due_date: { [Op.gte]: now },
      },
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
        },
      ],
      order: [['due_date', 'ASC']],
      limit: limit,
    });

    return tasks;
  },

  async getRecentActivities(limit = 5) {
    // Son eklenen belgeler
    const recentDocuments = await Document.findAll({
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['first_name', 'last_name'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: limit,
    });

    // Son oluşturulan davalar
    const recentCases = await Case.findAll({
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['first_name', 'last_name'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: limit,
    });

    return {
      recentDocuments,
      recentCases,
    };
  },
};
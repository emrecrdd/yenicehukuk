import { Client } from '../../models/Client.js';
import { Case } from '../../models/Case.js';
import { Payment } from '../../models/Payment.js';
import { Note } from '../../models/Note.js';
import { User } from '../../models/User.js';
import { Op } from 'sequelize';
import { paginate, getPaginationData } from '../../utils/paginate.js';

export const clientService = {
  async create(data) {
    return Client.create(data);
  },

  async findAll({ page, limit, search, status, tags }) {
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } }, // ✅ name
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { identification_number: { [Op.iLike]: `%${search}%` } }, // ✅ identification_number
      ];
    }

    if (status) {
      where.status = status;
    }

    if (tags) {
      where.tags = { [Op.overlap]: tags.split(',') };
    }

    const query = paginate({ where }, page, limit);
    const { count, rows } = await Client.findAndCountAll({
      ...query,
      include: [
        {
          model: Case,
          as: 'cases',
          attributes: ['id', 'title', 'status', 'opening_date'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const pagination = getPaginationData(count, page, limit);

    return {
      data: rows,
      pagination,
    };
  },

  async findOne(id) {
    const client = await Client.findByPk(id, {
      include: [
        {
          model: Case,
          as: 'cases',
          include: [
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
        },
        {
          model: Payment,
          as: 'payments',
        },
        {
          model: Note,
          as: 'clientNotes',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'first_name', 'last_name'],
            },
          ],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    if (!client) {
      throw new Error('Client not found');
    }

    return client;
  },

  async update(id, data) {
    const client = await Client.findByPk(id);
    if (!client) {
      throw new Error('Client not found');
    }

    await client.update(data);
    return client;
  },

  async remove(id) {
    const client = await Client.findByPk(id);
    if (!client) {
      throw new Error('Client not found');
    }

    await client.destroy();
    return client;
  },

  async getStatistics(userId) {
    const totalClients = await Client.count();
    const activeClients = await Client.count({ where: { status: 'active' } });
    const totalCases = await Case.count();
    const totalPayments = await Payment.sum('amount', { where: { status: 'completed' } });

    return {
      totalClients,
      activeClients,
      totalCases,
      totalPayments: totalPayments || 0,
    };
  },

  async getCaseHistory(clientId) {
    return Case.findAll({
      where: { client_id: clientId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  },

  async getPayments(clientId) {
    return Payment.findAll({
      where: { client_id: clientId },
      order: [['payment_date', 'DESC']],
    });
  },

  async getNotes(clientId) {
    return Note.findAll({
      where: { client_id: clientId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  },
};
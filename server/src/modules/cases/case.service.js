import { Case } from '../../models/Case.js';
import { CaseParty } from '../../models/CaseParty.js';
import { Client } from '../../models/Client.js';
import { User } from '../../models/User.js';
import { Document } from '../../models/Document.js';
import { Task } from '../../models/Task.js';
import { Event } from '../../models/Event.js';
import { Payment } from '../../models/Payment.js';
import { Note } from '../../models/Note.js';
import { Op } from 'sequelize';
import { paginate, getPaginationData } from '../../utils/paginate.js';

export const caseService = {
  async create(data) {
    return Case.create(data);
  },

  async findAll({ page, limit, search, status, case_type, client_id }) {
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { case_number: { [Op.iLike]: `%${search}%` } },
        { court_name: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (case_type) {
      where.case_type = case_type;
    }

    if (client_id) {
      where.client_id = client_id;
    }

    const query = paginate({ where }, page, limit);
    const { count, rows } = await Case.findAndCountAll({
      ...query,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name', 'company_name'],
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
        {
          model: CaseParty,
          as: 'parties',
          attributes: ['id', 'party_type', 'name'],
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
    const caseItem = await Case.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client',
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
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: CaseParty,
          as: 'parties',
        },
        {
          model: Document,
          as: 'documents',
          include: [
            {
              model: User,
              as: 'uploader',
              attributes: ['id', 'first_name', 'last_name'],
            },
          ],
        },
        {
          model: Task,
          as: 'tasks',
          include: [
            {
              model: User,
              as: 'assignee',
              attributes: ['id', 'first_name', 'last_name'],
            },
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'first_name', 'last_name'],
            },
          ],
        },
        {
          model: Event,
          as: 'events',
          include: [
            {
              model: User,
              as: 'creator',
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
          as: 'notes',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'first_name', 'last_name'],
            },
          ],
        },
      ],
    });

    if (!caseItem) {
      throw new Error('Case not found');
    }

    return caseItem;
  },

  async update(id, data) {
    const caseItem = await Case.findByPk(id);
    if (!caseItem) {
      throw new Error('Case not found');
    }

    await caseItem.update(data);
    return caseItem;
  },

  async remove(id) {
    const caseItem = await Case.findByPk(id);
    if (!caseItem) {
      throw new Error('Case not found');
    }

    await caseItem.destroy();
    return caseItem;
  },

  async addParty(caseId, partyData) {
    const caseItem = await Case.findByPk(caseId);
    if (!caseItem) {
      throw new Error('Case not found');
    }

    return CaseParty.create({ ...partyData, case_id: caseId });
  },

  async removeParty(caseId, partyId) {
    const party = await CaseParty.findOne({ where: { id: partyId, case_id: caseId } });
    if (!party) {
      throw new Error('Party not found');
    }

    await party.destroy();
  },

  async getParties(caseId) {
    return CaseParty.findAll({ where: { case_id: caseId } });
  },

  async getDocuments(caseId) {
    return Document.findAll({ where: { case_id: caseId } });
  },

  async getTasks(caseId) {
    return Task.findAll({ where: { case_id: caseId } });
  },

  async getEvents(caseId) {
    return Event.findAll({ where: { case_id: caseId } });
  },

  async getPayments(caseId) {
    return Payment.findAll({ where: { case_id: caseId } });
  },

  async getNotes(caseId) {
    return Note.findAll({ where: { case_id: caseId } });
  },

  async getStatistics(userId) {
    const totalCases = await Case.count();
    const activeCases = await Case.count({ where: { status: 'active' } });
    const preparation = await Case.count({ where: { status: 'preparation' } });
    const concluded = await Case.count({ where: { status: 'concluded' } });
    
    const totalValue = await Case.sum('estimated_value');

    return {
      totalCases,
      activeCases,
      preparation,
      concluded,
      totalValue: totalValue || 0,
    };
  },

  async updateStatus(id, status) {
    const caseItem = await Case.findByPk(id);
    if (!caseItem) {
      throw new Error('Case not found');
    }

    await caseItem.update({ status });
    return caseItem;
  },
};
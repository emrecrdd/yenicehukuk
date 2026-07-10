import { PowerOfAttorney } from '../../models/PowerOfAttorney.js';
import { Client } from '../../models/Client.js';
import { Case } from '../../models/Case.js';
import { User } from '../../models/User.js';
import { Document } from '../../models/Document.js';  // ✅ EKLENDI
import { Op } from 'sequelize';
import { paginate, getPaginationData } from '../../utils/paginate.js';

export const powerOfAttorneyService = {
  async create(data) {
    return PowerOfAttorney.create(data);
  },

  // ✅ findAll - documents include edildi
  async findAll({ page, limit, client_id, case_id, status, search }) {
    const where = {};

    if (client_id) {
      where.client_id = client_id;
    }

    if (case_id) {
      where.case_id = case_id;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { '$client.name$': { [Op.iLike]: `%${search}%` } },
        { '$case.title$': { [Op.iLike]: `%${search}%` } },
      ];
    }

    const query = paginate({ where }, page, limit);
    const { count, rows } = await PowerOfAttorney.findAndCountAll({
      ...query,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'identification_number', 'phone', 'email'],
        },
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title', 'case_number'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: Document,  // ✅ EKLENDI
          as: 'documents',
          attributes: ['id', 'name', 'original_name', 'file_size', 'file_type', 'created_at'],
          limit: 1,  // Sadece ilk belgeyi göster (liste için yeterli)
          order: [['created_at', 'DESC']],
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

  // ✅ findOne - documents include edildi
  async findOne(id) {
    const powerOfAttorney = await PowerOfAttorney.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'identification_number', 'phone', 'email', 'address'],
        },
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title', 'case_number', 'court_name'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: Document,  // ✅ EKLENDI
          as: 'documents',
          attributes: ['id', 'name', 'original_name', 'file_size', 'file_type', 'created_at', 'file_path'],
        },
      ],
    });

    if (!powerOfAttorney) {
      throw new Error('Vekaletname bulunamadı');
    }

    return powerOfAttorney;
  },

  // ✅ findByClient - documents include edildi
  async findByClient(clientId) {
    return PowerOfAttorney.findAll({
      where: { client_id: clientId },
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title', 'case_number'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: Document,  // ✅ EKLENDI
          as: 'documents',
          attributes: ['id', 'name', 'original_name', 'file_size', 'file_type', 'created_at'],
          limit: 1,
          order: [['created_at', 'DESC']],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  },

  async update(id, data) {
    const powerOfAttorney = await PowerOfAttorney.findByPk(id);
    if (!powerOfAttorney) {
      throw new Error('Vekaletname bulunamadı');
    }

    await powerOfAttorney.update(data);
    return powerOfAttorney;
  },

  async delete(id) {
    const powerOfAttorney = await PowerOfAttorney.findByPk(id);
    if (!powerOfAttorney) {
      throw new Error('Vekaletname bulunamadı');
    }

    await powerOfAttorney.destroy();
    return powerOfAttorney;
  },

  async updateStatus(id, status) {
    const powerOfAttorney = await PowerOfAttorney.findByPk(id);
    if (!powerOfAttorney) {
      throw new Error('Vekaletname bulunamadı');
    }

    await powerOfAttorney.update({ status });
    return powerOfAttorney;
  },

  async getStatistics() {
    const total = await PowerOfAttorney.count();
    const active = await PowerOfAttorney.count({ where: { status: 'active' } });
    const expired = await PowerOfAttorney.count({ where: { status: 'expired' } });
    const cancelled = await PowerOfAttorney.count({ where: { status: 'cancelled' } });

    return {
      total,
      active,
      expired,
      cancelled,
    };
  },
};
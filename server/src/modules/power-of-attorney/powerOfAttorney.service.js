import { PowerOfAttorney } from '../../models/PowerOfAttorney.js';
import { Client } from '../../models/Client.js';
import { Case } from '../../models/Case.js';
import { User } from '../../models/User.js';
import { Op } from 'sequelize';
import { paginate, getPaginationData } from '../../utils/paginate.js';

export const powerOfAttorneyService = {
  // ✅ Yeni Vekaletname Oluştur
  async create(data) {
    return PowerOfAttorney.create(data);
  },

  // ✅ Tüm Vekaletnameleri Getir
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
          attributes: ['id', 'name', 'email'],
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

  // ✅ Tek Vekaletname Getir
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
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!powerOfAttorney) {
      throw new Error('Vekaletname bulunamadı');
    }

    return powerOfAttorney;
  },

  // ✅ Müvekkile Göre Vekaletnameler
  async findByClient(clientId) {
    return PowerOfAttorney.findAll({
      where: { client_id: clientId },
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title', 'case_number'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  },

  // ✅ Vekaletname Güncelle
  async update(id, data) {
    const powerOfAttorney = await PowerOfAttorney.findByPk(id);
    if (!powerOfAttorney) {
      throw new Error('Vekaletname bulunamadı');
    }

    await powerOfAttorney.update(data);
    return powerOfAttorney;
  },

  // ✅ Vekaletname Sil
  async delete(id) {
    const powerOfAttorney = await PowerOfAttorney.findByPk(id);
    if (!powerOfAttorney) {
      throw new Error('Vekaletname bulunamadı');
    }

    await powerOfAttorney.destroy();
    return powerOfAttorney;
  },

  // ✅ Vekaletname Durum Güncelle
  async updateStatus(id, status) {
    const powerOfAttorney = await PowerOfAttorney.findByPk(id);
    if (!powerOfAttorney) {
      throw new Error('Vekaletname bulunamadı');
    }

    await powerOfAttorney.update({ status });
    return powerOfAttorney;
  },

  // ✅ İstatistik
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
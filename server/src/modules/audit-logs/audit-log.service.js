import { AuditLog } from '../../models/AuditLog.js';
import { User } from '../../models/User.js';  // ✅ BUNU EKLE!
import { Op } from 'sequelize';
import { paginate, getPaginationData } from '../../utils/paginate.js';

export const auditLogService = {
  // ✅ Tüm logları getir (filtreli)
  async findAll({ page = 1, limit = 20, action, entity_type, startDate, endDate, search }) {
    const where = {};

    if (action) {
      where.action = action;
    }

    if (entity_type) {
      where.entity_type = entity_type;
    }

    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    if (search) {
      where[Op.or] = [
        { description: { [Op.iLike]: `%${search}%` } },
        { entity_id: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const query = paginate({ where, order: [['created_at', 'DESC']] }, page, limit);
    const { count, rows } = await AuditLog.findAndCountAll({
      ...query,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
      ],
    });

    const pagination = getPaginationData(count, page, limit);

    return {
      data: rows,
      pagination,
    };
  },

  // ✅ Tek bir log getir
  async findOne(id) {
    const log = await AuditLog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
      ],
    });

    if (!log) {
      throw new Error('Log bulunamadı');
    }

    return log;
  },
};
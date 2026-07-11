import { Template } from '../../models/Template.js';
import { User } from '../../models/User.js';
import { Op } from 'sequelize';
import { paginate, getPaginationData } from '../../utils/paginate.js';

export const templateService = {
  async create(data) {
    return Template.create(data);
  },

  async findAll({ page, limit, category, law_area, search }) {
    const where = {};
    if (category) where.category = category;
    if (law_area) where.law_area = law_area;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const query = paginate({ where }, page, limit);
    const { count, rows } = await Template.findAndCountAll({
      ...query,
      include: [
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
    const template = await Template.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    if (!template) {
      throw new Error('Template not found');
    }

    return template;
  },

  async update(id, data) {
    const template = await Template.findByPk(id);
    if (!template) {
      throw new Error('Template not found');
    }

    await template.update(data);
    return template;
  },

  async remove(id) {
    const template = await Template.findByPk(id);
    if (!template) {
      throw new Error('Template not found');
    }

    await template.destroy();
    return template;
  },

  async incrementDownload(id) {
    const template = await Template.findByPk(id);
    if (!template) {
      throw new Error('Template not found');
    }

    await template.increment('download_count');
    return template;
  },

  async getCategories() {
    const categories = await Template.findAll({
      attributes: ['category'],
      group: ['category'],
    });
    return categories.map(c => c.category).filter(Boolean);
  },

  async getLawAreas() {
    const lawAreas = await Template.findAll({
      attributes: ['law_area'],
      group: ['law_area'],
    });
    return lawAreas.map(l => l.law_area).filter(Boolean);
  },
};
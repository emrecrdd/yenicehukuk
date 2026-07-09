import { Client } from '../../models/Client.js';
import { Op } from 'sequelize';

export const clientRepository = {
  create: (data) => Client.create(data),

  findAll: ({ where, ...options }) => Client.findAll({ where, ...options }),

  findAndCountAll: (options) => Client.findAndCountAll(options),

  findById: (id, options = {}) => Client.findByPk(id, options),

  update: (id, data) => Client.update(data, { where: { id } }),

  delete: (id) => Client.destroy({ where: { id } }),

  count: (where = {}) => Client.count({ where }),

  findByEmail: (email) => Client.findOne({ where: { email } }),

  // ✅ TCKNO / VKN ile bul
  findByIdentificationNumber: (identificationNumber) => 
    Client.findOne({ where: { identification_number: identificationNumber } }),

  // ✅ search - name ve identification_number ile ara
  search: (query) => {
    return Client.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { identification_number: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { phone: { [Op.iLike]: `%${query}%` } },
        ],
      },
    });
  },
};
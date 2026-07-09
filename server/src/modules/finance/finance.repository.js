import { Payment } from '../../models/Payment.js';
import { Op } from 'sequelize';

export const financeRepository = {
  create: (data) => Payment.create(data),

  findAll: (options) => Payment.findAll(options),

  findAndCountAll: (options) => Payment.findAndCountAll(options),

  findById: (id, options = {}) => Payment.findByPk(id, options),

  update: (id, data) => Payment.update(data, { where: { id } }),

  delete: (id) => Payment.destroy({ where: { id } }),

  sum: (field, where = {}) => Payment.sum(field, { where }),

  count: (where = {}) => Payment.count({ where }),

  findByClientId: (clientId) => {
    return Payment.findAll({
      where: { client_id: clientId },
      order: [['payment_date', 'DESC']],
    });
  },

  findByCaseId: (caseId) => {
    return Payment.findAll({
      where: { case_id: caseId },
      order: [['payment_date', 'DESC']],
    });
  },

  getMonthlyRevenue: (year) => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    return Payment.findAll({
      where: {
        payment_date: { [Op.between]: [startDate, endDate] },
        status: 'completed',
      },
      attributes: [
        [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('payment_date')), 'month'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'total'],
      ],
      group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('payment_date'))],
      order: [[Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('payment_date')), 'ASC']],
      raw: true,
    });
  },

  getOutstandingPayments: () => {
    return Payment.findAll({
      where: {
        status: 'pending',
        due_date: { [Op.lt]: new Date() },
      },
      order: [['due_date', 'ASC']],
    });
  },
};
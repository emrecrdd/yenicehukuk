import { Sequelize } from 'sequelize';
import { Payment } from '../../models/Payment.js';
import { Client } from '../../models/Client.js';
import { Case } from '../../models/Case.js';
import { User } from '../../models/User.js';
import { Op } from 'sequelize';
import { paginate, getPaginationData } from '../../utils/paginate.js';

export const financeService = {
  async createPayment(data) {
    return Payment.create(data);
  },

  // ✅ GÜNCELLENMİŞ - search parametresi eklendi
  async findAllPayments({ page, limit, client_id, case_id, status, start_date, end_date, search }) {
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

    if (start_date && end_date) {
      where.payment_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)],
      };
    }

    // ✅ SEARCH EKLENDİ
    if (search) {
      where[Op.or] = [
        { '$client.first_name$': { [Op.iLike]: `%${search}%` } },
        { '$client.last_name$': { [Op.iLike]: `%${search}%` } },
        { '$client.company_name$': { [Op.iLike]: `%${search}%` } },
        { '$case.title$': { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const query = paginate({ where }, page, limit);
    const { count, rows } = await Payment.findAndCountAll({
      ...query,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name', 'company_name'],
        },
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [['payment_date', 'DESC']],
    });

    const pagination = getPaginationData(count, page, limit);

    return {
      data: rows,
      pagination,
    };
  },

  async findOnePayment(id) {
    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'phone', 'email'],
        },
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title', 'case_number'],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  },

  async updatePayment(id, data) {
    const payment = await Payment.findByPk(id);
    if (!payment) {
      throw new Error('Payment not found');
    }

    await payment.update(data);
    return payment;
  },

  async removePayment(id) {
    const payment = await Payment.findByPk(id);
    if (!payment) {
      throw new Error('Payment not found');
    }

    await payment.destroy();
    return payment;
  },

  async getClientPayments(clientId) {
    return Payment.findAll({
      where: { client_id: clientId },
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
        },
      ],
      order: [['payment_date', 'DESC']],
    });
  },

  async getCasePayments(caseId) {
    return Payment.findAll({
      where: { case_id: caseId },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [['payment_date', 'DESC']],
    });
  },

  async getFinancialSummary() {
    try {
      const totalReceived = await Payment.sum('amount', {
        where: { 
          status: 'completed',
          payment_type: 'received'
        },
      }) || 0;

      const totalPending = await Payment.sum('amount', {
        where: { 
          status: 'pending',
          payment_type: 'received'
        },
      }) || 0;

      const totalRefunded = await Payment.sum('amount', {
        where: { 
          status: 'completed',
          payment_type: 'refund'
        },
      }) || 0;

      const totalExpense = await Payment.sum('amount', {
        where: { 
          status: 'completed',
          payment_type: 'expense'
        },
      }) || 0;

      const totalAgreed = await Payment.sum('amount', {
        where: { 
          payment_type: 'agreed'
        },
      }) || 0;

      const totalClients = await Client.count() || 0;
      const totalCases = await Case.count() || 0;

      const avgResult = await Payment.findOne({
        attributes: [[Sequelize.fn('AVG', Sequelize.col('amount')), 'average']],
        where: { 
          status: 'completed',
          payment_type: 'received'
        },
        raw: true,
      });

      return {
        totalReceived,
        totalPending,
        totalRefunded,
        totalExpense,
        totalAgreed,
        netRevenue: totalReceived - totalExpense - totalRefunded,
        totalClients,
        totalCases,
        averagePayment: avgResult?.average || 0,
      };
    } catch (error) {
      console.error('getFinancialSummary error:', error);
      return {
        totalReceived: 0,
        totalPending: 0,
        totalRefunded: 0,
        totalExpense: 0,
        totalAgreed: 0,
        netRevenue: 0,
        totalClients: 0,
        totalCases: 0,
        averagePayment: 0,
      };
    }
  },

  async getMonthlyRevenue(year) {
    try {
      const yearToUse = year || new Date().getFullYear();
      const startDate = new Date(yearToUse, 0, 1);
      const endDate = new Date(yearToUse, 11, 31);

      const payments = await Payment.findAll({
        where: {
          payment_date: { [Op.between]: [startDate, endDate] },
          status: 'completed',
          payment_type: 'received',
        },
        attributes: [
          [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('payment_date')), 'month'],
          [Sequelize.fn('SUM', Sequelize.col('amount')), 'total'],
        ],
        group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('payment_date'))],
        order: [[Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('payment_date')), 'ASC']],
        raw: true,
      });

      const result = [];
      for (let i = 0; i < 12; i++) {
        const month = i + 1;
        const found = payments?.find(p => {
          if (!p?.month) return false;
          const monthNum = new Date(p.month).getMonth() + 1;
          return monthNum === month;
        });
        result.push({
          month,
          total: found ? parseFloat(found.total) || 0 : 0,
          label: new Date(yearToUse, i, 1).toLocaleString('tr-TR', { month: 'long' }),
        });
      }

      return result;
    } catch (error) {
      console.error('getMonthlyRevenue error:', error);
      return [];
    }
  },

  async getClientFinancialSummary(clientId) {
    const client = await Client.findByPk(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const totalAgreed = await Case.sum('estimated_value', {
      where: { client_id: clientId },
    });

    const totalReceived = await Payment.sum('amount', {
      where: { client_id: clientId, status: 'completed' },
    });

    const totalPending = await Payment.sum('amount', {
      where: { client_id: clientId, status: 'pending' },
    });

    const payments = await Payment.findAll({
      where: { client_id: clientId },
      order: [['payment_date', 'DESC']],
      limit: 10,
    });

    return {
      clientName: `${client.first_name} ${client.last_name}`,
      totalAgreed: totalAgreed || 0,
      totalReceived: totalReceived || 0,
      totalPending: totalPending || 0,
      balance: (totalAgreed || 0) - (totalReceived || 0),
      recentPayments: payments,
    };
  },

  async getOutstandingPayments() {
    return Payment.findAll({
      where: {
        status: 'pending',
        due_date: { [Op.lt]: new Date() },
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name', 'company_name', 'phone', 'email'],
        },
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title'],
        },
      ],
      order: [['due_date', 'ASC']],
    });
  },

  async getPaymentStatistics() {
    const totalPayments = await Payment.count();
    const completedPayments = await Payment.count({ where: { status: 'completed' } });
    const pendingPayments = await Payment.count({ where: { status: 'pending' } });
    const cancelledPayments = await Payment.count({ where: { status: 'cancelled' } });
    const refundedPayments = await Payment.count({ where: { status: 'refund' } });

    const paymentMethods = await Payment.findAll({
      attributes: [
        'payment_method',
        [Sequelize.fn('COUNT', Sequelize.col('payment_method')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'total'],
      ],
      group: ['payment_method'],
      raw: true,
    });

    return {
      total: {
        total: totalPayments,
        completed: completedPayments,
        pending: pendingPayments,
        cancelled: cancelledPayments,
        refund: refundedPayments,
      },
      byMethod: paymentMethods,
    };
  },
};
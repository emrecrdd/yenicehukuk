import { clientService } from './client.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';
import { logger } from '../../config/logger.js';
import { AuditLog } from '../../models/AuditLog.js';

export const clientController = {
  async create(req, res) {
    try {
      const clientData = { ...req.body, created_by: req.user.id };
      const client = await clientService.create(clientData);

      await AuditLog.create({
        action: 'create',
        entity_type: 'client',
        entity_id: client.id,
        user_id: req.user.id,
        description: `"${client.name}" müvekkili oluşturuldu`, // ✅ değişti
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, client, 'Client created successfully', 201);
    } catch (error) {
      logger.error('Create client error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async findAll(req, res) {
    try {
      const { page = 1, limit = 10, search, status, tags } = req.query;
      const result = await clientService.findAll({ page, limit, search, status, tags });
      return paginatedResponse(res, result.data, result.pagination, 'Clients fetched successfully');
    } catch (error) {
      logger.error('Get clients error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async findOne(req, res) {
    try {
      console.log('🔍 findOne çağrıldı, ID:', req.params.id);
      const client = await clientService.findOne(req.params.id);
      console.log('📋 Bulunan client:', client);
      return successResponse(res, client, 'Client fetched successfully');
    } catch (error) {
      console.error('❌ Hata:', error);
      logger.error('Get client error:', error);
      return errorResponse(res, error.message, 404);
    }
  },

  async update(req, res) {
    try {
      const client = await clientService.update(req.params.id, req.body);

      await AuditLog.create({
        action: 'update',
        entity_type: 'client',
        entity_id: client.id,
        user_id: req.user.id,
        description: `"${client.name}" müvekkili güncellendi`, // ✅ değişti
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, client, 'Client updated successfully');
    } catch (error) {
      logger.error('Update client error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async remove(req, res) {
    try {
      const client = await clientService.findOne(req.params.id);
      await clientService.remove(req.params.id);

      await AuditLog.create({
        action: 'delete',
        entity_type: 'client',
        entity_id: req.params.id,
        user_id: req.user.id,
        description: `"${client.name}" müvekkili silindi`, // ✅ değişti
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, null, 'Client deleted successfully');
    } catch (error) {
      logger.error('Delete client error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getStatistics(req, res) {
    try {
      const stats = await clientService.getStatistics(req.user.id);
      return successResponse(res, stats, 'Client statistics fetched successfully');
    } catch (error) {
      logger.error('Get client statistics error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getCaseHistory(req, res) {
    try {
      const cases = await clientService.getCaseHistory(req.params.id);
      return successResponse(res, cases, 'Case history fetched successfully');
    } catch (error) {
      logger.error('Get case history error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getPayments(req, res) {
    try {
      const payments = await clientService.getPayments(req.params.id);
      return successResponse(res, payments, 'Payments fetched successfully');
    } catch (error) {
      logger.error('Get payments error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getNotes(req, res) {
    try {
      const notes = await clientService.getNotes(req.params.id);
      return successResponse(res, notes, 'Notes fetched successfully');
    } catch (error) {
      logger.error('Get notes error:', error);
      return errorResponse(res, error.message, 400);
    }
  },
};
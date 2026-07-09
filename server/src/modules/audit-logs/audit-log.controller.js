import { auditLogService } from './audit-log.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';
import { logger } from '../../config/logger.js';

export const auditLogController = {
  async findAll(req, res) {
    try {
      const { page = 1, limit = 20, action, entity_type, startDate, endDate, search } = req.query;
      const result = await auditLogService.findAll({ page, limit, action, entity_type, startDate, endDate, search });
      return paginatedResponse(res, result.data, result.pagination, 'Loglar başarıyla getirildi');
    } catch (error) {
      logger.error('Get audit logs error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async findOne(req, res) {
    try {
      const log = await auditLogService.findOne(req.params.id);
      return successResponse(res, log, 'Log başarıyla getirildi');
    } catch (error) {
      logger.error('Get audit log error:', error);
      return errorResponse(res, error.message, 404);
    }
  },
};
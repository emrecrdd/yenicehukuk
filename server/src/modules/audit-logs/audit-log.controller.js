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

  // ✅ YENİ: Tek log sil
  async remove(req, res) {
    try {
      await auditLogService.remove(req.params.id);
      return successResponse(res, null, 'Log başarıyla silindi');
    } catch (error) {
      logger.error('Delete audit log error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ✅ YENİ: Toplu log sil
  async removeMany(req, res) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return errorResponse(res, 'Lütfen silinecek logları seçin', 400);
      }

      const result = await auditLogService.removeMany(ids);
      return successResponse(res, result, `${result.deletedCount} log başarıyla silindi`);
    } catch (error) {
      logger.error('Bulk delete audit logs error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ✅ YENİ: Eski logları temizle
  async cleanOldLogs(req, res) {
    try {
      const { days = 30 } = req.query;
      const result = await auditLogService.cleanOldLogs(parseInt(days));
      return successResponse(res, result, `${result.deletedCount} eski log silindi`);
    } catch (error) {
      logger.error('Clean old logs error:', error);
      return errorResponse(res, error.message, 400);
    }
  },
};
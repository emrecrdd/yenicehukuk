import { casePartyService } from './case-party.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';
import { logger } from '../../config/logger.js';
import { AuditLog } from '../../models/AuditLog.js';

export const casePartyController = {
  // ✅ Taraf oluştur
  async create(req, res) {
    try {
      const { caseId } = req.params;
      const partyData = { ...req.body, case_id: caseId };
      
      const party = await casePartyService.create(partyData);

      await AuditLog.create({
        action: 'create',
        entity_type: 'case_party',
        entity_id: party.id,
        user_id: req.user.id,
        description: `"${party.name}" davaya taraf olarak eklendi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, party, 'Taraf başarıyla oluşturuldu', 201);
    } catch (error) {
      logger.error('Create case party error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ✅ Bir davaya ait tarafları getir
  async getByCase(req, res) {
    try {
      const { caseId } = req.params;
      const parties = await casePartyService.findByCase(caseId);
      return successResponse(res, parties, 'Taraflar başarıyla getirildi');
    } catch (error) {
      logger.error('Get case parties error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ✅ Tüm tarafları getir (paginated)
  async findAll(req, res) {
    try {
      const { page = 1, limit = 10, case_id, party_type } = req.query;
      const result = await casePartyService.findAll({ page, limit, case_id, party_type });
      return paginatedResponse(res, result.data, result.pagination, 'Taraflar başarıyla getirildi');
    } catch (error) {
      logger.error('Get all case parties error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ✅ Tek bir tarafı getir
  async findOne(req, res) {
    try {
      const party = await casePartyService.findOne(req.params.id);
      return successResponse(res, party, 'Taraf başarıyla getirildi');
    } catch (error) {
      logger.error('Get case party error:', error);
      return errorResponse(res, error.message, 404);
    }
  },

  // ✅ Taraf güncelle
  async update(req, res) {
    try {
      const party = await casePartyService.update(req.params.id, req.body);

      await AuditLog.create({
        action: 'update',
        entity_type: 'case_party',
        entity_id: party.id,
        user_id: req.user.id,
        description: `"${party.name}" taraf bilgileri güncellendi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, party, 'Taraf başarıyla güncellendi');
    } catch (error) {
      logger.error('Update case party error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ✅ Taraf sil
  async remove(req, res) {
    try {
      const party = await casePartyService.findOne(req.params.id);
      await casePartyService.remove(req.params.id);

      await AuditLog.create({
        action: 'delete',
        entity_type: 'case_party',
        entity_id: req.params.id,
        user_id: req.user.id,
        description: `"${party.name}" tarafı silindi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, null, 'Taraf başarıyla silindi');
    } catch (error) {
      logger.error('Delete case party error:', error);
      return errorResponse(res, error.message, 400);
    }
  },
};
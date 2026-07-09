import { meetingService } from './meeting.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';
import { logger } from '../../config/logger.js';
import { AuditLog } from '../../models/AuditLog.js';

export const meetingController = {
  async create(req, res) {
    try {
      const meetingData = { ...req.body, created_by: req.user.id };
      const meeting = await meetingService.create(meetingData);

      await AuditLog.create({
        action: 'create',
        entity_type: 'meeting',
        entity_id: meeting.id,
        user_id: req.user.id,
        description: `"${meeting.title}" toplantısı oluşturuldu`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, meeting, 'Meeting created successfully', 201);
    } catch (error) {
      logger.error('Create meeting error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async findAll(req, res) {
    try {
      const { page = 1, limit = 10, search, status, meeting_type, case_id, client_id } = req.query;
      const result = await meetingService.findAll({ page, limit, search, status, meeting_type, case_id, client_id });
      return paginatedResponse(res, result.data, result.pagination, 'Meetings fetched successfully');
    } catch (error) {
      logger.error('Get meetings error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async findOne(req, res) {
    try {
      const meeting = await meetingService.findOne(req.params.id);
      return successResponse(res, meeting, 'Meeting fetched successfully');
    } catch (error) {
      logger.error('Get meeting error:', error);
      return errorResponse(res, error.message, 404);
    }
  },

  async update(req, res) {
    try {
      const meeting = await meetingService.update(req.params.id, req.body);

      await AuditLog.create({
        action: 'update',
        entity_type: 'meeting',
        entity_id: meeting.id,
        user_id: req.user.id,
        description: `"${meeting.title}" toplantısı güncellendi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, meeting, 'Meeting updated successfully');
    } catch (error) {
      logger.error('Update meeting error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async remove(req, res) {
    try {
      const meeting = await meetingService.findOne(req.params.id);
      await meetingService.remove(req.params.id);

      await AuditLog.create({
        action: 'delete',
        entity_type: 'meeting',
        entity_id: req.params.id,
        user_id: req.user.id,
        description: `"${meeting.title}" toplantısı silindi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, null, 'Meeting deleted successfully');
    } catch (error) {
      logger.error('Delete meeting error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getMyMeetings(req, res) {
    try {
      const meetings = await meetingService.getMyMeetings(req.user.id);
      return successResponse(res, meetings, 'My meetings fetched successfully');
    } catch (error) {
      logger.error('Get my meetings error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getByCase(req, res) {
    try {
      const meetings = await meetingService.getByCase(req.params.caseId);
      return successResponse(res, meetings, 'Case meetings fetched successfully');
    } catch (error) {
      logger.error('Get case meetings error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getByClient(req, res) {
    try {
      const meetings = await meetingService.getByClient(req.params.clientId);
      return successResponse(res, meetings, 'Client meetings fetched successfully');
    } catch (error) {
      logger.error('Get client meetings error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getUpcoming(req, res) {
    try {
      const meetings = await meetingService.getUpcoming(req.user.id);
      return successResponse(res, meetings, 'Upcoming meetings fetched successfully');
    } catch (error) {
      logger.error('Get upcoming meetings error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const meeting = await meetingService.updateStatus(req.params.id, status);

      await AuditLog.create({
        action: 'update',
        entity_type: 'meeting',
        entity_id: meeting.id,
        user_id: req.user.id,
        description: `"${meeting.title}" toplantı durumu "${status}" olarak güncellendi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, meeting, 'Meeting status updated successfully');
    } catch (error) {
      logger.error('Update meeting status error:', error);
      return errorResponse(res, error.message, 400);
    }
  },
};
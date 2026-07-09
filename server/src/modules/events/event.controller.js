import { eventService } from './event.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';
import { logger } from '../../config/logger.js';
import { AuditLog } from '../../models/AuditLog.js';

export const eventController = {
  async create(req, res) {
    try {
      const eventData = { ...req.body, created_by: req.user.id };
      const event = await eventService.create(eventData);

      await AuditLog.create({
        action: 'create',
        entity_type: 'event',
        entity_id: event.id,
        user_id: req.user.id,
        description: `"${event.title}" duruşması oluşturuldu`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, event, 'Event created successfully', 201);
    } catch (error) {
      logger.error('Create event error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async findAll(req, res) {
    try {
      const { page = 1, limit = 10, case_id, status } = req.query;
      const result = await eventService.findAll({ page, limit, case_id, status });
      return paginatedResponse(res, result.data, result.pagination, 'Events fetched successfully');
    } catch (error) {
      logger.error('Get events error:', error);
      return errorResponse(res, error.message, 400);
    }
  },
// ✅ BURAYI EKLE (diğer fonksiyonların yanına)
async getCalendarEvents(req, res) {
  try {
    const { year, month } = req.query;
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    const events = await eventService.getCalendarEvents(req.user.id, {
      year: parseInt(currentYear),
      month: parseInt(currentMonth),
    });

    return successResponse(res, events, 'Calendar events fetched successfully');
  } catch (error) {
    logger.error('Get calendar events error:', error);
    return errorResponse(res, error.message, 400);
  }
},
  async getMyEvents(req, res) {
    try {
      const events = await eventService.getMyEvents(req.user.id);
      return successResponse(res, events, 'My events fetched successfully');
    } catch (error) {
      logger.error('Get my events error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getByCase(req, res) {
    try {
      const events = await eventService.getByCase(req.params.caseId);
      return successResponse(res, events, 'Case events fetched successfully');
    } catch (error) {
      logger.error('Get case events error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async findOne(req, res) {
    try {
      const event = await eventService.findOne(req.params.id);
      return successResponse(res, event, 'Event fetched successfully');
    } catch (error) {
      logger.error('Get event error:', error);
      return errorResponse(res, error.message, 404);
    }
  },

  async update(req, res) {
    try {
      const event = await eventService.update(req.params.id, req.body);

      await AuditLog.create({
        action: 'update',
        entity_type: 'event',
        entity_id: event.id,
        user_id: req.user.id,
        description: `"${event.title}" duruşması güncellendi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, event, 'Event updated successfully');
    } catch (error) {
      logger.error('Update event error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async remove(req, res) {
    try {
      const event = await eventService.findOne(req.params.id);
      await eventService.remove(req.params.id);

      await AuditLog.create({
        action: 'delete',
        entity_type: 'event',
        entity_id: req.params.id,
        user_id: req.user.id,
        description: `"${event.title}" duruşması silindi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, null, 'Event deleted successfully');
    } catch (error) {
      logger.error('Delete event error:', error);
      return errorResponse(res, error.message, 400);
    }
  },
};
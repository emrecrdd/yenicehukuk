import { aiService } from './ai.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { logger } from '../../config/logger.js';
import { AuditLog } from '../../models/AuditLog.js';

export const aiController = {
  async analyzeDocument(req, res) {
    try {
      if (!req.file) {
        return errorResponse(res, 'No file uploaded', 400);
      }

      const result = await aiService.analyzeDocument(req.file);

      await AuditLog.create({
        action: 'create',
        entity_type: 'ai_analysis',
        entity_id: 'document_analysis',
        user_id: req.user.id,
        description: 'AI document analysis performed',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        metadata: { fileName: req.file.originalname },
      });

      return successResponse(res, result, 'Document analyzed successfully');
    } catch (error) {
      logger.error('AI analyze document error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async summarizeCase(req, res) {
    try {
      const { caseId } = req.params;
      const result = await aiService.summarizeCase(caseId);

      await AuditLog.create({
        action: 'create',
        entity_type: 'ai_summary',
        entity_id: caseId,
        user_id: req.user.id,
        description: 'AI case summary generated',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, result, 'Case summarized successfully');
    } catch (error) {
      logger.error('AI summarize case error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async generateLegalAdvice(req, res) {
    try {
      const { query, context } = req.body;
      const result = await aiService.generateLegalAdvice(query, context);

      await AuditLog.create({
        action: 'create',
        entity_type: 'ai_advice',
        entity_id: 'legal_advice',
        user_id: req.user.id,
        description: 'AI legal advice generated',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, result, 'Legal advice generated successfully');
    } catch (error) {
      logger.error('AI generate legal advice error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async extractEntities(req, res) {
    try {
      const { text } = req.body;
      const result = await aiService.extractEntities(text);
      return successResponse(res, result, 'Entities extracted successfully');
    } catch (error) {
      logger.error('AI extract entities error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async generateDraft(req, res) {
    try {
      const { type, data } = req.body;
      const result = await aiService.generateDraft(type, data);

      await AuditLog.create({
        action: 'create',
        entity_type: 'ai_draft',
        entity_id: 'draft_generation',
        user_id: req.user.id,
        description: `AI draft generated: ${type}`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, result, 'Draft generated successfully');
    } catch (error) {
      logger.error('AI generate draft error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async classifyDocument(req, res) {
    try {
      if (!req.file) {
        return errorResponse(res, 'No file uploaded', 400);
      }

      const result = await aiService.classifyDocument(req.file);
      return successResponse(res, result, 'Document classified successfully');
    } catch (error) {
      logger.error('AI classify document error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getCaseRecommendations(req, res) {
    try {
      const { caseId } = req.params;
      const result = await aiService.getCaseRecommendations(caseId);
      return successResponse(res, result, 'Recommendations generated successfully');
    } catch (error) {
      logger.error('AI get recommendations error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async analyzeSentiment(req, res) {
    try {
      const { text } = req.body;
      const result = await aiService.analyzeSentiment(text);
      return successResponse(res, result, 'Sentiment analysis completed');
    } catch (error) {
      logger.error('AI analyze sentiment error:', error);
      return errorResponse(res, error.message, 400);
    }
  },
};
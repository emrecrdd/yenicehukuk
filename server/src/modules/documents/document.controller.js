import { documentService } from './document.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';
import { logger } from '../../config/logger.js';
import { AuditLog } from '../../models/AuditLog.js';

export const documentController = {
  async upload(req, res) {
    try {
      if (!req.file) {
        return errorResponse(res, 'No file uploaded', 400);
      }

      const documentData = {
        ...req.body,
        uploaded_by: req.user.id,
        file: req.file,
      };

      const document = await documentService.upload(documentData);

      await AuditLog.create({
        action: 'upload',
        entity_type: 'document',
        entity_id: document.id,
        user_id: req.user.id,
        description: `"${document.name}" belgesi yüklendi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, document, 'Document uploaded successfully', 201);
    } catch (error) {
      logger.error('Upload document error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ✅ TOPLU YÜKLEME
  async uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return errorResponse(res, 'No files uploaded', 400);
      }

      const documents = [];
      const errors = [];

      for (const file of req.files) {
        try {
          const documentData = {
            ...req.body,
            uploaded_by: req.user.id,
            file: file,
            name: req.body.name || file.originalname,
          };
          const document = await documentService.upload(documentData);
          documents.push(document);
        } catch (error) {
          errors.push({ file: file.originalname, error: error.message });
        }
      }

      await AuditLog.create({
        action: 'upload',
        entity_type: 'document',
        entity_id: documents[0]?.id || 'multiple',
        user_id: req.user.id,
        description: `${documents.length} documents uploaded, ${errors.length} failed`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, { 
        success: documents.length,
        failed: errors.length,
        documents,
        errors,
      }, `${documents.length} documents uploaded successfully`, 201);
    } catch (error) {
      logger.error('Upload multiple documents error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async findAll(req, res) {
    try {
      const { page = 1, limit = 10, search, category, case_id, client_id } = req.query;
      const result = await documentService.findAll({ page, limit, search, category, case_id, client_id });
      return paginatedResponse(res, result.data, result.pagination, 'Documents fetched successfully');
    } catch (error) {
      logger.error('Get documents error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async findOne(req, res) {
    try {
      const document = await documentService.findOne(req.params.id);
      return successResponse(res, document, 'Document fetched successfully');
    } catch (error) {
      logger.error('Get document error:', error);
      return errorResponse(res, error.message, 404);
    }
  },

  async update(req, res) {
    try {
      const document = await documentService.update(req.params.id, req.body);

      await AuditLog.create({
        action: 'update',
        entity_type: 'document',
        entity_id: document.id,
        user_id: req.user.id,
        description: `"${document.name}" belgesi güncellendi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, document, 'Document updated successfully');
    } catch (error) {
      logger.error('Update document error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async remove(req, res) {
    try {
      const document = await documentService.findOne(req.params.id);
      await documentService.remove(req.params.id);

      await AuditLog.create({
        action: 'delete',
        entity_type: 'document',
        entity_id: req.params.id,
        user_id: req.user.id,
        description: `"${document.name}" belgesi silindi`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      return successResponse(res, null, 'Document deleted successfully');
    } catch (error) {
      logger.error('Delete document error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async download(req, res) {
    try {
      const document = await documentService.findOne(req.params.id);
      const fileStream = await documentService.download(document);

      const fileName = encodeURIComponent(document.original_name)
        .replace(/['()]/g, escape)
        .replace(/\*/g, '%2A');

      res.setHeader('Content-Type', document.mime_type);
      res.setHeader(
        'Content-Disposition', 
        `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`
      );
      
      await AuditLog.create({
        action: 'download',
        entity_type: 'document',
        entity_id: document.id,
        user_id: req.user.id,
        description: `Document ${document.name} downloaded`,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

      fileStream.pipe(res);
    } catch (error) {
      logger.error('Download document error:', error);
      return errorResponse(res, error.message, 404);
    }
  },

  async preview(req, res) {
    try {
      const document = await documentService.findOne(req.params.id);
      const fileStream = await documentService.download(document);

      res.setHeader('Content-Type', document.mime_type);
      res.setHeader(
        'Content-Disposition', 
        `inline; filename="${encodeURIComponent(document.original_name)}"`
      );
      
      fileStream.pipe(res);
    } catch (error) {
      logger.error('Preview document error:', error);
      return errorResponse(res, error.message, 404);
    }
  },

  async getVersions(req, res) {
    try {
      const versions = await documentService.getVersions(req.params.id);
      return successResponse(res, versions, 'Versions fetched successfully');
    } catch (error) {
      logger.error('Get versions error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getCategories(req, res) {
    try {
      const categories = await documentService.getCategories();
      return successResponse(res, categories, 'Categories fetched successfully');
    } catch (error) {
      logger.error('Get categories error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getStatistics(req, res) {
    try {
      const stats = await documentService.getStatistics(req.user.id);
      return successResponse(res, stats, 'Document statistics fetched successfully');
    } catch (error) {
      logger.error('Get document statistics error:', error);
      return errorResponse(res, error.message, 400);
    }
  },
};
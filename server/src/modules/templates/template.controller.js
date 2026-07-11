import { templateService } from './template.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';
import { logger } from '../../config/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const templateController = {
  async create(req, res) {
    try {
      console.log('📥 REQ.BODY:', req.body);
      console.log('📁 REQ.FILE:', req.file);

      const data = {
        ...req.body,
        created_by: req.user.id,
      };

      if (req.file) {
        data.file_url = `/uploads/${req.file.filename}`;
        data.file_name = req.file.originalname;
        data.file_size = req.file.size;
        data.file_type = req.file.mimetype;
      }

      const template = await templateService.create(data);
      return successResponse(res, template, 'Template created successfully', 201);
    } catch (error) {
      logger.error('Create template error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async findAll(req, res) {
    try {
      const { page = 1, limit = 10, category, law_area, search } = req.query;
      const result = await templateService.findAll({ page, limit, category, law_area, search });
      return paginatedResponse(res, result.data, result.pagination, 'Templates fetched successfully');
    } catch (error) {
      logger.error('Get templates error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async findOne(req, res) {
    try {
      const template = await templateService.findOne(req.params.id);
      return successResponse(res, template, 'Template fetched successfully');
    } catch (error) {
      logger.error('Get template error:', error);
      return errorResponse(res, error.message, 404);
    }
  },

  async update(req, res) {
    try {
      const data = { ...req.body, updated_by: req.user.id };
      if (req.file) {
        data.file_url = `/uploads/${req.file.filename}`;
        data.file_name = req.file.originalname;
        data.file_size = req.file.size;
        data.file_type = req.file.mimetype;
      }
      const template = await templateService.update(req.params.id, data);
      return successResponse(res, template, 'Template updated successfully');
    } catch (error) {
      logger.error('Update template error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async remove(req, res) {
    try {
      await templateService.remove(req.params.id);
      return successResponse(res, null, 'Template deleted successfully');
    } catch (error) {
      logger.error('Delete template error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  // ✅ DÜZELTİLMİŞ DOWNLOAD METODU
  async download(req, res) {
  try {
    console.log('📥 Download isteği, ID:', req.params.id);
    
    const template = await templateService.findOne(req.params.id);
    
    // ✅ file_url kontrolü
    if (!template.file_url) {
      console.error('❌ file_url boş!');
      return errorResponse(res, 'Dosya bulunamadı', 404);
    }

    // Dosya yolunu kontrol et
    const filePath = path.join(__dirname, '../../../uploads', path.basename(template.file_url));
    console.log('📁 Dosya yolu:', filePath);
    
    // Dosya var mı kontrol et
    if (!fs.existsSync(filePath)) {
      console.error('❌ Dosya bulunamadı:', filePath);
      return errorResponse(res, 'Dosya bulunamadı', 404);
    }

    // İndirme sayısını artır
    await templateService.incrementDownload(req.params.id);

    // Dosyayı indir
    res.download(filePath, template.file_name, (err) => {
      if (err) {
        logger.error('Download error:', err);
        return errorResponse(res, 'Dosya indirilemedi', 500);
      }
    });
  } catch (error) {
    logger.error('Download template error:', error);
    return errorResponse(res, error.message, 404);
  }
},

  async getLawAreas(req, res) {
    try {
      const lawAreas = await templateService.getLawAreas();
      return successResponse(res, lawAreas, 'Law areas fetched successfully');
    } catch (error) {
      logger.error('Get law areas error:', error);
      return errorResponse(res, error.message, 400);
    }
  },
};
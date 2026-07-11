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

      // ✅ DOSYA KAYDETME - DÜZELTİLDİ
      if (req.file) {
        // Uploads klasörünü kontrol et
        const uploadDir = path.join(__dirname, '../../../uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Benzersiz dosya adı oluştur
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(req.file.originalname);
        const filename = uniqueSuffix + ext;
        const filePath = path.join(uploadDir, filename);

        // Dosyayı diske yaz (memoryStorage kullanıldığı için buffer'dan oku)
        fs.writeFileSync(filePath, req.file.buffer);

        // Veritabanına kaydet
        data.file_url = `/uploads/${filename}`;
        data.file_name = req.file.originalname;
        data.file_size = req.file.size;
        data.file_type = req.file.mimetype;
        
        console.log('✅ Dosya kaydedildi:', filePath);
        console.log('✅ file_url:', data.file_url);
      } else {
        console.warn('⚠️ Dosya yok! req.file undefined');
      }

      const template = await templateService.create(data);
      console.log('✅ Template oluşturuldu:', template.id);
      
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
      
      // ✅ UPDATE - DOSYA KAYDETME
      if (req.file) {
        const uploadDir = path.join(__dirname, '../../../uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(req.file.originalname);
        const filename = uniqueSuffix + ext;
        const filePath = path.join(uploadDir, filename);

        fs.writeFileSync(filePath, req.file.buffer);

        data.file_url = `/uploads/${filename}`;
        data.file_name = req.file.originalname;
        data.file_size = req.file.size;
        data.file_type = req.file.mimetype;
        
        console.log('✅ Dosya güncellendi:', filePath);
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
      // ✅ Önce dosyayı sil
      const template = await templateService.findOne(req.params.id);
      if (template.file_url) {
        const filePath = path.join(__dirname, '../../../uploads', path.basename(template.file_url));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('✅ Dosya silindi:', filePath);
        }
      }
      
      await templateService.remove(req.params.id);
      return successResponse(res, null, 'Template deleted successfully');
    } catch (error) {
      logger.error('Delete template error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async getCategories(req, res) {
    try {
      const categories = await templateService.getCategories();
      return successResponse(res, categories, 'Categories fetched successfully');
    } catch (error) {
      logger.error('Get categories error:', error);
      return errorResponse(res, error.message, 400);
    }
  },

  async download(req, res) {
    try {
      console.log('📥 Download isteği, ID:', req.params.id);
      
      const template = await templateService.findOne(req.params.id);
      
      if (!template.file_url) {
        console.error('❌ file_url boş!');
        return errorResponse(res, 'Dosya bulunamadı', 404);
      }

      const filePath = path.join(__dirname, '../../../uploads', path.basename(template.file_url));
      console.log('📁 Dosya yolu:', filePath);
      
      if (!fs.existsSync(filePath)) {
        console.error('❌ Dosya bulunamadı:', filePath);
        return errorResponse(res, 'Dosya bulunamadı', 404);
      }

      await templateService.incrementDownload(req.params.id);
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
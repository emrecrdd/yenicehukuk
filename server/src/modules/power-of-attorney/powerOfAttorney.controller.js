import { powerOfAttorneyService } from './powerOfAttorney.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { logger } from '../../config/logger.js';

export const powerOfAttorneyController = {
  // ✅ Yeni Vekaletname Oluştur
  async create(req, res) {
    try {
      const data = {
        ...req.body,
        created_by: req.user.id,
      };

      const powerOfAttorney = await powerOfAttorneyService.create(data);
      return successResponse(res, 201, powerOfAttorney, 'Vekaletname başarıyla oluşturuldu');
    } catch (error) {
      logger.error('Vekaletname oluşturma hatası:', error);
      return errorResponse(res, 400, error.message);
    }
  },

  // ✅ Tüm Vekaletnameleri Getir
  async findAll(req, res) {
    try {
      const { page = 1, limit = 10, client_id, case_id, status, search } = req.query;
      const result = await powerOfAttorneyService.findAll({
        page,
        limit,
        client_id,
        case_id,
        status,
        search,
      });
      return successResponse(res, 200, result, 'Vekaletnameler başarıyla getirildi');
    } catch (error) {
      logger.error('Vekaletnameler getirme hatası:', error);
      return errorResponse(res, 500, error.message);
    }
  },

  // ✅ Tek Vekaletname Getir
  async findOne(req, res) {
    try {
      const { id } = req.params;
      const powerOfAttorney = await powerOfAttorneyService.findOne(id);
      return successResponse(res, 200, powerOfAttorney, 'Vekaletname başarıyla getirildi');
    } catch (error) {
      logger.error('Vekaletname getirme hatası:', error);
      return errorResponse(res, 404, error.message);
    }
  },

  // ✅ Müvekkile Göre Vekaletnameler
  async findByClient(req, res) {
    try {
      const { clientId } = req.params;
      const powerOfAttorneys = await powerOfAttorneyService.findByClient(clientId);
      return successResponse(res, 200, powerOfAttorneys, 'Müvekkile ait vekaletnameler getirildi');
    } catch (error) {
      logger.error('Müvekkil vekaletnameleri getirme hatası:', error);
      return errorResponse(res, 500, error.message);
    }
  },

  // ✅ Vekaletname Güncelle
  async update(req, res) {
    try {
      const { id } = req.params;
      const powerOfAttorney = await powerOfAttorneyService.update(id, req.body);
      return successResponse(res, 200, powerOfAttorney, 'Vekaletname başarıyla güncellendi');
    } catch (error) {
      logger.error('Vekaletname güncelleme hatası:', error);
      return errorResponse(res, 400, error.message);
    }
  },

  // ✅ Vekaletname Sil
  async delete(req, res) {
    try {
      const { id } = req.params;
      await powerOfAttorneyService.delete(id);
      return successResponse(res, 200, null, 'Vekaletname başarıyla silindi');
    } catch (error) {
      logger.error('Vekaletname silme hatası:', error);
      return errorResponse(res, 404, error.message);
    }
  },

  // ✅ Vekaletname Durum Güncelle
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const powerOfAttorney = await powerOfAttorneyService.updateStatus(id, status);
      return successResponse(res, 200, powerOfAttorney, 'Durum başarıyla güncellendi');
    } catch (error) {
      logger.error('Vekaletname durum güncelleme hatası:', error);
      return errorResponse(res, 400, error.message);
    }
  },

  // ✅ İstatistik
  async getStatistics(req, res) {
    try {
      const stats = await powerOfAttorneyService.getStatistics();
      return successResponse(res, 200, stats, 'İstatistikler başarıyla getirildi');
    } catch (error) {
      logger.error('Vekaletname istatistik getirme hatası:', error);
      return errorResponse(res, 500, error.message);
    }
  },
};
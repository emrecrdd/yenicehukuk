import { powerOfAttorneyService } from './powerOfAttorney.service.js';
import { response } from '../../utils/response.js';

export const powerOfAttorneyController = {
  // ✅ Yeni Vekaletname Oluştur
  async create(req, res) {
    try {
      const data = {
        ...req.body,
        created_by: req.user.id,
      };

      const powerOfAttorney = await powerOfAttorneyService.create(data);
      return response.success(res, 201, powerOfAttorney, 'Vekaletname başarıyla oluşturuldu');
    } catch (error) {
      return response.error(res, 400, error.message);
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
      return response.success(res, 200, result);
    } catch (error) {
      return response.error(res, 500, error.message);
    }
  },

  // ✅ Tek Vekaletname Getir
  async findOne(req, res) {
    try {
      const { id } = req.params;
      const powerOfAttorney = await powerOfAttorneyService.findOne(id);
      return response.success(res, 200, powerOfAttorney);
    } catch (error) {
      return response.error(res, 404, error.message);
    }
  },

  // ✅ Müvekkile Göre Vekaletnameler
  async findByClient(req, res) {
    try {
      const { clientId } = req.params;
      const powerOfAttorneys = await powerOfAttorneyService.findByClient(clientId);
      return response.success(res, 200, powerOfAttorneys);
    } catch (error) {
      return response.error(res, 500, error.message);
    }
  },

  // ✅ Vekaletname Güncelle
  async update(req, res) {
    try {
      const { id } = req.params;
      const powerOfAttorney = await powerOfAttorneyService.update(id, req.body);
      return response.success(res, 200, powerOfAttorney, 'Vekaletname başarıyla güncellendi');
    } catch (error) {
      return response.error(res, 400, error.message);
    }
  },

  // ✅ Vekaletname Sil
  async delete(req, res) {
    try {
      const { id } = req.params;
      await powerOfAttorneyService.delete(id);
      return response.success(res, 200, null, 'Vekaletname başarıyla silindi');
    } catch (error) {
      return response.error(res, 404, error.message);
    }
  },

  // ✅ Vekaletname Durum Güncelle
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const powerOfAttorney = await powerOfAttorneyService.updateStatus(id, status);
      return response.success(res, 200, powerOfAttorney, 'Durum başarıyla güncellendi');
    } catch (error) {
      return response.error(res, 400, error.message);
    }
  },

  // ✅ İstatistik
  async getStatistics(req, res) {
    try {
      const stats = await powerOfAttorneyService.getStatistics();
      return response.success(res, 200, stats);
    } catch (error) {
      return response.error(res, 500, error.message);
    }
  },
};
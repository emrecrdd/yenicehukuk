import { powerOfAttorneyService } from './powerOfAttorney.service.js';
import { logger } from '../../config/logger.js';

export const powerOfAttorneyController = {
  async create(req, res) {
    try {
      const data = {
        ...req.body,
        created_by: req.user.id,
      };

      const powerOfAttorney = await powerOfAttorneyService.create(data);
      return res.status(201).json({
        success: true,
        message: 'Vekaletname başarıyla oluşturuldu',
        data: powerOfAttorney,
      });
    } catch (error) {
      logger.error('Vekaletname oluşturma hatası:', error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

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
      return res.status(200).json({
        success: true,
        message: 'Vekaletnameler başarıyla getirildi',
        data: result,
      });
    } catch (error) {
      logger.error('Vekaletnameler getirme hatası:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async findOne(req, res) {
    try {
      const { id } = req.params;
      const powerOfAttorney = await powerOfAttorneyService.findOne(id);
      return res.status(200).json({
        success: true,
        message: 'Vekaletname başarıyla getirildi',
        data: powerOfAttorney,
      });
    } catch (error) {
      logger.error('Vekaletname getirme hatası:', error);
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  },

  async findByClient(req, res) {
    try {
      const { clientId } = req.params;
      const powerOfAttorneys = await powerOfAttorneyService.findByClient(clientId);
      return res.status(200).json({
        success: true,
        message: 'Müvekkile ait vekaletnameler getirildi',
        data: powerOfAttorneys,
      });
    } catch (error) {
      logger.error('Müvekkil vekaletnameleri getirme hatası:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const powerOfAttorney = await powerOfAttorneyService.update(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Vekaletname başarıyla güncellendi',
        data: powerOfAttorney,
      });
    } catch (error) {
      logger.error('Vekaletname güncelleme hatası:', error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await powerOfAttorneyService.delete(id);
      return res.status(200).json({
        success: true,
        message: 'Vekaletname başarıyla silindi',
        data: null,
      });
    } catch (error) {
      logger.error('Vekaletname silme hatası:', error);
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  },

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const powerOfAttorney = await powerOfAttorneyService.updateStatus(id, status);
      return res.status(200).json({
        success: true,
        message: 'Durum başarıyla güncellendi',
        data: powerOfAttorney,
      });
    } catch (error) {
      logger.error('Vekaletname durum güncelleme hatası:', error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getStatistics(req, res) {
    try {
      const stats = await powerOfAttorneyService.getStatistics();
      return res.status(200).json({
        success: true,
        message: 'İstatistikler başarıyla getirildi',
        data: stats,
      });
    } catch (error) {
      logger.error('Vekaletname istatistik getirme hatası:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};
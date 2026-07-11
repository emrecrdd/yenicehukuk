import { powerOfAttorneyService } from './powerOfAttorney.service.js';
import { documentService } from '../documents/document.service.js';
import { logger } from '../../config/logger.js';

export const powerOfAttorneyController = {
  async create(req, res) {
    try {
      // 🔥 DEBUG - req.file ve req.body'i kontrol et
      console.log('🔥🔥🔥 CREATE ÇAĞRILDI!');
      console.log('📁 req.file:', req.file);
      console.log('📁 req.body:', req.body);
      console.log('📁 req.headers["content-type"]:', req.headers['content-type']);

      const data = {
        ...req.body,
        created_by: req.user.id,
      };

      // authorities JSON parse et (frontend'den string geliyor)
      if (data.authorities && typeof data.authorities === 'string') {
        try {
          data.authorities = JSON.parse(data.authorities);
        } catch (e) {
          data.authorities = [];
        }
      }

      // 1️⃣ VEKALETNAMEYİ KAYDET
      const powerOfAttorney = await powerOfAttorneyService.create(data);
      console.log('✅ Vekaletname kaydedildi:', powerOfAttorney.id);

      // 2️⃣ DOSYA VARSA BELGE OLARAK KAYDET
      if (req.file) {
        try {
          console.log('📁 Dosya işleniyor:', req.file.originalname);

          const documentData = {
            file: req.file,
            name: data.title + ' - Vekaletname',
            original_name: req.file.originalname,
            description: data.description || 'Vekaletname belgesi',
            category: 'general',
            uploaded_by: req.user.id,
            power_of_attorney_id: powerOfAttorney.id,
            client_id: data.client_id,
            case_id: data.case_id || null,
            is_public: false,
            tags: ['vekaletname'],
          };

          const savedDoc = await documentService.upload(documentData);
          console.log('✅ Belge kaydedildi:', savedDoc.id);
          logger.info(`📎 Vekaletname belgesi yüklendi: ${req.file.originalname}`);
        } catch (docError) {
          console.error('❌ Belge yükleme hatası:', docError);
          logger.error('Belge yükleme hatası:', docError);

          // Vekaletname oluştu ama belge yüklenemedi
          return res.status(201).json({
            success: true,
            message: 'Vekaletname oluşturuldu ama belge yüklenemedi',
            data: powerOfAttorney,
            warning: docError.message || 'Belge yüklenirken bir hata oluştu',
          });
        }
      } else {
        console.log('⚠️ Dosya yok, sadece vekaletname kaydedildi.');
      }

      return res.status(201).json({
        success: true,
        message: 'Vekaletname başarıyla oluşturuldu',
        data: powerOfAttorney,
      });
    } catch (error) {
      console.error('❌ Vekaletname oluşturma hatası:', error);
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
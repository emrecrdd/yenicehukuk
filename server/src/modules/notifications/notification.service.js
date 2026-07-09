import { Notification } from '../../models/Notification.js';
import { Op } from 'sequelize';
import { paginate, getPaginationData } from '../../utils/paginate.js';

let ioInstance = null;

export const setIo = (io) => {
  ioInstance = io;
};

export const notificationService = {
  // ✅ Bildirim oluştur + Socket ile gönder
  async create(userId, type, title, message, link = null, metadata = {}) {
    const notification = await Notification.create({
      user_id: userId,
      type,
      title,
      message,
      link,
      metadata,
      read: false,  // ✅ EKLE
    });

    // Socket ile gönder
    if (ioInstance) {
      ioInstance.to(`user-${userId}`).emit('notification', {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        link: notification.link,
        read: notification.read,
        created_at: notification.created_at,
        metadata: notification.metadata,
      });
    }

    return notification;
  },

  // ✅ Kullanıcının bildirimlerini getir
  async getByUser(userId, { page = 1, limit = 10, read = null }) {
    const where = { user_id: userId };

    if (read !== null) {
      where.read = read;
    }

    const query = paginate({ where, order: [['created_at', 'DESC']] }, page, limit);
    const { count, rows } = await Notification.findAndCountAll({
      ...query,
    });

    const pagination = getPaginationData(count, page, limit);

    return {
      data: rows,
      pagination,
    };
  },

  // ✅ Okunmamış bildirim sayısı
  async getUnreadCount(userId) {
    return Notification.count({
      where: {
        user_id: userId,
        read: false,
      },
    });
  },

  // ✅ Tek bildirim getir
  async getOne(id) {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      throw new Error('Bildirim bulunamadı');
    }
    return notification;
  },

  // ✅ Okundu işaretle
  async markAsRead(id) {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      throw new Error('Bildirim bulunamadı');
    }
    await notification.update({ read: true });
    return notification;
  },

  // ✅ Tümünü okundu işaretle
  async markAllAsRead(userId) {
    await Notification.update(
      { read: true },
      {
        where: {
          user_id: userId,
          read: false,
        },
      }
    );
    return { success: true };
  },

  // ✅ Bildirim sil
  async remove(id) {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      throw new Error('Bildirim bulunamadı');
    }
    await notification.destroy();
    return notification;
  },

  // ✅ Tüm bildirimleri sil
  async removeAll(userId) {
    await Notification.destroy({
      where: { user_id: userId },
    });
    return { success: true };
  },

  // ============ TETİKLEYİCİLER ============

  // ✅ Görev atama bildirimi
  async notifyTaskAssigned(userId, taskId, taskTitle, assignedBy) {
    return this.create(
      userId,
      'task',
      '📋 Yeni Görev Atandı',
      `${assignedBy} size "${taskTitle}" görevini atadı.`,
      `/tasks/${taskId}`,
      { taskId }
    );
  },

  // ✅ Duruşma hatırlatıcı
  async notifyHearingReminder(userId, eventId, eventTitle, eventDate) {
    const dateStr = new Date(eventDate).toLocaleDateString('tr-TR');
    return this.create(
      userId,
      'event',
      '⚖️ Duruşma Hatırlatıcı',
      `"${eventTitle}" duruşmanız ${dateStr} tarihinde.`,
      `/events/${eventId}`,
      { eventId, eventDate }
    );
  },

  // ✅ Toplantı hatırlatıcı
  async notifyMeetingReminder(userId, meetingId, meetingTitle, meetingDate) {
    const dateStr = new Date(meetingDate).toLocaleDateString('tr-TR');
    return this.create(
      userId,
      'event',
      '👤 Toplantı Hatırlatıcı',
      `"${meetingTitle}" toplantınız ${dateStr} tarihinde.`,
      `/meetings/${meetingId}`,
      { meetingId, meetingDate }
    );
  },

  // ✅ Yeni belge bildirimi
  async notifyDocumentUploaded(userId, documentId, documentName, uploadedBy, caseTitle) {
    return this.create(
      userId,
      'system',
      '📄 Yeni Belge Yüklendi',
      `${uploadedBy} "${documentName}" belgesini ${caseTitle ? caseTitle + ' davasına' : ''} yükledi.`,
      `/documents/${documentId}`,
      { documentId }
    );
  },

  // ✅ Dava durumu değişikliği
  async notifyCaseStatusChanged(userId, caseId, caseTitle, oldStatus, newStatus) {
    const statusMap = {
      preparation: 'Hazırlık',
      active: 'Devam Ediyor',
      hearing: 'Duruşmada',
      appeal: 'İstinaf',
      cassation: 'Temyiz',
      concluded: 'Sonuçlandı',
      archived: 'Arşivlendi',
    };
    return this.create(
      userId,
      'system',
      '📁 Dava Durumu Değişti',
      `"${caseTitle}" davasının durumu "${statusMap[oldStatus] || oldStatus}" → "${statusMap[newStatus] || newStatus}" olarak değiştirildi.`,
      `/cases/${caseId}`,
      { caseId, oldStatus, newStatus }
    );
  },
};
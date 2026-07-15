import axios from 'axios';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

class EmailService {
  constructor() {
    this.isConfigured = !!config.BREVO_API_KEY;

    if (this.isConfigured) {
      logger.info('✅ Brevo Email API configured');
    } else {
      logger.warn('⚠️ BREVO_API_KEY not found');
    }
  }

  async sendEmail({ to, subject, html, text }) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured');
      return null;
    }

    try {
     const response = await axios.post(
  'https://api.brevo.com/v3/smtp/email',
  {
    sender: {
      name: 'Derkenar Hukuk Bürosu Yönetim Sistemi',
      email: 'emrecirdi0@gmail.com',
    },

    to: [
      {
        email: to,
      },
    ],

    subject,

    htmlContent: html,

    textContent:
      text ||
      html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
  },
  {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': config.BREVO_API_KEY,
    },
  }
);

      logger.info(`✅ Email sent to ${to}`);
      return response.data;
    } catch (error) {
      logger.error(
        '❌ Brevo API Error:',
        error.response?.data || error.message
      );

      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  async sendWelcomeEmail(user) {
    const html = `
      <h1>Hoş Geldiniz ${user.first_name}!</h1>
      <p>Derkenar Hukuk Bürosu Yönetim Sistemi'ne kayıt olduğunuz için teşekkür ederiz.</p>
      <p>Hesabınızı aktifleştirmek için aşağıdaki linke tıklayın:</p>
      <a href="${config.CLIENT_URL}/verify-email?token=${user.email_verification_token}">
        Hesabı Aktifleştir
      </a>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Hoş Geldiniz - Derkenar Hukuk Bürosu Yönetim Sistemi',
      html,
    });
  }

  async sendPasswordResetEmail(user, token) {
    const resetLink = `${config.CLIENT_URL}/reset-password?token=${token}`;

    const html = `
      <h1>🔑 Şifre Sıfırlama</h1>
      <p>Merhaba ${user.first_name},</p>
      <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>

      <p>
        <a href="${resetLink}"
           style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">
          Şifreyi Sıfırla
        </a>
      </p>

      <p>Bu link <strong>1 saat</strong> boyunca geçerlidir.</p>

      <p>Eğer bu talebi siz oluşturmadıysanız bu e-postayı yok sayabilirsiniz.</p>

      <hr>

      <p style="font-size:12px;color:#6b7280;">
        Derkenar Hukuk Bürosu Yönetim Sistemi
      </p>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '🔑 Şifre Sıfırlama - Derkenar Hukuk Bürosu Yönetim Sistemi',
      html,
    });
  }

  async sendTaskReminder(task, user) {
    const html = `
      <h1>⏰ Görev Hatırlatması</h1>

      <p>Merhaba ${user.first_name},</p>

      <p>"${task.title}" görevinizin son tarihi yaklaşıyor.</p>

      <p><strong>Son Tarih:</strong> ${new Date(task.due_date).toLocaleString(
        'tr-TR'
      )}</p>

      <a href="${config.CLIENT_URL}/tasks/${task.id}">
        Görevi Görüntüle
      </a>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '⏰ Görev Hatırlatması',
      html,
    });
  }

  async sendEventReminder(event, user) {
    const html = `
      <h1>📅 Etkinlik Hatırlatması</h1>

      <p>Merhaba ${user.first_name},</p>

      <p>"${event.title}" etkinliği yaklaşıyor.</p>

      <p><strong>Tarih:</strong> ${new Date(event.start_date).toLocaleString(
        'tr-TR'
      )}</p>

      ${
        event.location
          ? `<p><strong>Yer:</strong> ${event.location}</p>`
          : ''
      }

      <a href="${config.CLIENT_URL}/calendar">
        Takvimi Görüntüle
      </a>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '📅 Etkinlik Hatırlatması',
      html,
    });
  }

  async sendNotification(user, title, message, link) {
    const html = `
      <h1>${title}</h1>

      <p>Merhaba ${user.first_name},</p>

      <p>${message}</p>

      ${
        link
          ? `<a href="${link}">Detayları Görüntüle</a>`
          : ''
      }
    `;

    return this.sendEmail({
      to: user.email,
      subject: title,
      html,
    });
  }
}

export const emailService = new EmailService();
export default emailService;
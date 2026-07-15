import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;

    if (config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT || 587,
        secure: config.SMTP_PORT === 465,
        // ✅ IPv4 zorla (Render IPv6 sorununu çözer)
        family: 4,
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS,
        },
        // ✅ Timeout ayarları
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });
      this.isConfigured = true;
      logger.info('✅ Email service configured');
    } else {
      logger.warn('⚠️ Email service not configured');
    }
  }

  async sendEmail({ to, subject, html, text }) {
    if (!this.isConfigured) {
      logger.warn('Email not sent - service not configured');
      return null;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"Derkenar Hukuk Bürosu Yönetim Sistemi" <${config.SMTP_USER}>`,
        to,
        subject,
        html,
        text,
      });

      logger.info(`✅ Email sent to ${to}`);
      return info;
    } catch (error) {
      logger.error('❌ Email send error:', error);
      
      // ✅ Mock modu - email gönderilemezse log'la
      if (process.env.NODE_ENV === 'production') {
        logger.warn('📧 Email could not be sent, but continuing...');
        return { success: false, error: error.message };
      }
      
      throw error;
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
        <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">
          Şifreyi Sıfırla
        </a>
      </p>
      <p>Bu link <strong>1 saat</strong> boyunca geçerlidir.</p>
      <p>Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı dikkate almayın.</p>
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
      <p>"${task.title}" görevinizin son tarihi yaklaşıyor:</p>
      <p><strong>Son Tarih:</strong> ${new Date(task.due_date).toLocaleString('tr-TR')}</p>
      <a href="${config.CLIENT_URL}/tasks/${task.id}">
        Görevi Görüntüle
      </a>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '⏰ Görev Hatırlatması - Derkenar Hukuk Bürosu Yönetim Sistemi',
      html,
    });
  }

  async sendEventReminder(event, user) {
    const html = `
      <h1>📅 Etkinlik Hatırlatması</h1>
      <p>Merhaba ${user.first_name},</p>
      <p>"${event.title}" etkinliği yaklaşıyor:</p>
      <p><strong>Tarih:</strong> ${new Date(event.start_date).toLocaleString('tr-TR')}</p>
      ${event.location ? `<p><strong>Yer:</strong> ${event.location}</p>` : ''}
      <a href="${config.CLIENT_URL}/calendar">
        Takvimi Görüntüle
      </a>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '📅 Etkinlik Hatırlatması - Derkenar Hukuk Bürosu Yönetim Sistemi',
      html,
    });
  }

  async sendNotification(user, title, message, link) {
    const html = `
      <h1>${title}</h1>
      <p>Merhaba ${user.first_name},</p>
      <p>${message}</p>
      ${link ? `<a href="${link}">Detayları Görüntüle</a>` : ''}
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
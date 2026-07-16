// ✅ Bull ve Redis'i pasif yap (şimdilik)
import { logger } from '../config/logger.js';

// ✅ Basit memory queue (mock)
class MemoryQueue {
  constructor(name) {
    this.name = name;
    this.jobs = [];
  }

  async add(data) {
    const job = { id: Date.now(), data, timestamp: new Date() };
    this.jobs.push(job);
    logger.info(`📥 ${this.name} job added (mock):`, job.id);
    
    // ✅ Bildirimleri hemen işle (asenkron)
    if (this.name === 'notification-queue') {
      setTimeout(() => {
        this.process(data);
      }, 100);
    }
    
    // ✅ Email queue için de hemen işle
    if (this.name === 'email-queue') {
      setTimeout(() => {
        this.process(data);
      }, 100);
    }
    
    return job;
  }

  async process(data) {
    // ✅ Notification queue için GERÇEK işlem
    if (this.name === 'notification-queue') {
      try {
        const { notificationService } = await import('../modules/notifications/notification.service.js');
        
        const notification = await notificationService.create(
          data.userId,
          data.type || 'system',
          data.title || 'Bildirim',
          data.message,
          data.link || null,
          data.metadata || {}
        );
        
        logger.info(`✅ Notification created: ${notification.id} for user ${data.userId}`);
        return notification;
      } catch (error) {
        logger.error(`❌ Notification create failed:`, error);
        throw error;
      }
    }
    
    // ✅ Email queue için GERÇEK işlem
    if (this.name === 'email-queue') {
      try {
        const { emailService } = await import('../integrations/email.service.js');
        
        const result = await emailService.sendEmail({
          to: data.to,
          subject: data.subject,
          html: data.html,
          text: data.text,
        });
        
        logger.info(`📧 Email sent to: ${data.to}, Subject: ${data.subject}`);
        return result;
      } catch (error) {
        logger.error(`❌ Email send failed:`, error);
        return { success: false, error: error.message };
      }
    }
    
    // AI queue için
    if (this.name === 'ai-queue') {
      logger.info(`🤖 AI job processed:`, data);
      return { processed: true };
    }
  }

  async getJobCounts() {
    return { waiting: 0, active: 0, completed: this.jobs.length, failed: 0 };
  }

  async clean() {
    this.jobs = [];
  }

  on() {}
}

// ✅ Queue'ları oluştur
export const emailQueue = new MemoryQueue('email-queue');
export const notificationQueue = new MemoryQueue('notification-queue');
export const aiQueue = new MemoryQueue('ai-queue');

// ✅ Event handler'lar
const setupQueueEvents = (queue, name) => {
  queue.on('completed', (job) => {
    logger.info(`✅ ${name} job completed: ${job.id}`);
  });
};

setupQueueEvents(emailQueue, 'Email');
setupQueueEvents(notificationQueue, 'Notification');
setupQueueEvents(aiQueue, 'AI');

// ✅ Job fonksiyonları
export const addEmailJob = async (data, options = {}) => {
  return emailQueue.add(data);
};

export const addNotificationJob = async (data, options = {}) => {
  return notificationQueue.add(data);
};

export const addAIJob = async (data, options = {}) => {
  return aiQueue.add(data);
};

// Bulk operations
export const addEmailJobs = async (jobs) => {
  const results = [];
  for (const job of jobs) {
    results.push(await emailQueue.add(job));
  }
  return results;
};

export const addNotificationJobs = async (jobs) => {
  const results = [];
  for (const job of jobs) {
    results.push(await notificationQueue.add(job));
  }
  return results;
};

export const addAIJobs = async (jobs) => {
  const results = [];
  for (const job of jobs) {
    results.push(await aiQueue.add(job));
  }
  return results;
};

export const getQueueStatus = async () => {
  return {
    email: await emailQueue.getJobCounts(),
    notification: await notificationQueue.getJobCounts(),
    ai: await aiQueue.getJobCounts(),
  };
};

export const cleanQueues = async () => {
  await emailQueue.clean();
  await notificationQueue.clean();
  await aiQueue.clean();
};

export default {
  emailQueue,
  notificationQueue,
  aiQueue,
  addEmailJob,
  addNotificationJob,
  addAIJob,
  addEmailJobs,
  addNotificationJobs,
  addAIJobs,
  getQueueStatus,
  cleanQueues,
};
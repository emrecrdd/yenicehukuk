import cron from 'node-cron';
import { Op } from 'sequelize';
import { logger } from '../config/logger.js';
import { Task } from '../models/Task.js';
import { Event } from '../models/Event.js';
import { Meeting } from '../models/Meeting.js';
import { User } from '../models/User.js';
import { addNotificationJob, addEmailJob } from './queue.js';
import { sequelize } from '../config/database.js';

class ReminderJob {
  constructor() {
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      logger.warn('⚠️ Reminder jobs already running');
      return;
    }

    this.isRunning = true;

    // Check upcoming tasks - every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      await this.checkUpcomingTasks();
    });

    // Check upcoming events - every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      await this.checkUpcomingEvents();
    });

    // Check upcoming meetings - every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      await this.checkUpcomingMeetings();
    });

    // Check overdue tasks - hourly
    cron.schedule('0 * * * *', async () => {
      await this.checkOverdueTasks();
    });

    // Daily summary - every day at 8 AM
    cron.schedule('0 8 * * *', async () => {
      await this.sendDailySummary();
    });

    // Weekly summary - every Monday at 9 AM
    cron.schedule('0 9 * * 1', async () => {
      await this.sendWeeklySummary();
    });

    logger.info('✅ Reminder jobs started');
  }

  // ============================================
  // ✅ MEETING REMINDER - ÇİFT HATIRLATMA (1 GÜN + 1 SAAT)
  // ============================================
  async checkUpcomingMeetings() {
    try {
      const now = new Date();
      
      const meetings = await sequelize.query(
        `SELECT * FROM meetings 
         WHERE start_date > :now 
         AND status = 'scheduled'
         AND deleted_at IS NULL`,
        {
          replacements: { now },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      console.log(`📊 Toplam ${meetings?.length || 0} toplantı bulundu`);

      if (!meetings || meetings.length === 0) {
        console.log('📭 Hiç toplantı yok');
        return;
      }

      for (const meeting of meetings) {
        let assignee = null;
        if (meeting.assigned_to) {
          const assigneeResult = await sequelize.query(
            `SELECT id, email, first_name, last_name FROM users WHERE id = :id AND deleted_at IS NULL`,
            {
              replacements: { id: meeting.assigned_to },
              type: sequelize.QueryTypes.SELECT,
            }
          );
          assignee = assigneeResult[0] || null;
        }
        
        const creatorResult = await sequelize.query(
          `SELECT id, email, first_name, last_name FROM users WHERE id = :id AND deleted_at IS NULL`,
          {
            replacements: { id: meeting.created_by },
            type: sequelize.QueryTypes.SELECT,
          }
        );
        const creator = creatorResult[0] || null;

        const startDate = new Date(meeting.start_date);
        
        // ✅ SAAT FARKI (Saat cinsinden)
        const diffHours = (startDate - now) / (1000 * 60 * 60);

        console.log(`📅 Toplantı: ${meeting.title}, Başlangıç: ${startDate}`);
        console.log(`⏰ Fark: ${diffHours.toFixed(2)} saat`);

        const recipients = [];
        if (assignee) recipients.push(assignee);
        if (creator && creator.id !== assignee?.id) {
          recipients.push(creator);
        }

        // ✅ 1. HATIRLATMA: 1 GÜN ÖNCE (23.5 - 24 saat arası)
        if (
          diffHours <= 24 &&
          diffHours > 23.5 &&
          !meeting.reminder_sent_1
        ) {
          console.log(`✅ 1. hatırlatma gönderiliyor: ${meeting.title}`);
          for (const user of recipients) {
            if (!user) continue;
            await this.sendMeetingReminder(user, meeting, '1 Gün Önce');
          }
          await sequelize.query(
            `UPDATE meetings SET reminder_sent_1 = true, reminder_sent_at_1 = :now WHERE id = :id`,
            {
              replacements: { now, id: meeting.id },
            }
          );
          logger.info(`✅ Meeting 1-day reminder sent: ${meeting.id} (${meeting.title})`);
        }

        // ✅ 2. HATIRLATMA: 1 SAAT ÖNCE (0 - 1 saat arası)
        if (
          diffHours <= 1 &&
          diffHours > 0 &&
          !meeting.reminder_sent_2
        ) {
          console.log(`✅ 2. hatırlatma gönderiliyor: ${meeting.title}`);
          for (const user of recipients) {
            if (!user) continue;
            await this.sendMeetingReminder(user, meeting, '1 Saat Önce');
          }
          await sequelize.query(
            `UPDATE meetings SET reminder_sent_2 = true, reminder_sent_at_2 = :now WHERE id = :id`,
            {
              replacements: { now, id: meeting.id },
            }
          );
          logger.info(`✅ Meeting 1-hour reminder sent: ${meeting.id} (${meeting.title})`);
        }
      }
    } catch (error) {
      console.error('❌ Meeting reminder job error:', error);
      logger.error('❌ Meeting reminder job error:', error);
    }
  }

  // ✅ MEETING REMINDER GÖNDERME YARDIMCI METODU
  async sendMeetingReminder(user, meeting, reminderType) {
    try {
      const startDate = new Date(meeting.start_date);
      
      // ✅ UTC direkt gösterim (zaman dilimi çevirme YOK)
      const dateStr = `${String(startDate.getUTCDate()).padStart(2, '0')}.${String(
        startDate.getUTCMonth() + 1
      ).padStart(2, '0')}.${startDate.getUTCFullYear()}`;
      
      const timeStr = `${String(startDate.getUTCHours()).padStart(2, '0')}:${String(
        startDate.getUTCMinutes()
      ).padStart(2, '0')}`;

      let title, message;
      if (reminderType === '1 Gün Önce') {
        title = '📅 Toplantı Hatırlatması (1 Gün Kaldı)';
        message = `"${meeting.title}" toplantınız yarın ${dateStr} tarihinde saat ${timeStr}'da.`;
      } else {
        title = '📅 Toplantı Hatırlatması (1 Saat Kaldı)';
        message = `"${meeting.title}" toplantınız 1 saat sonra ${dateStr} tarihinde saat ${timeStr}'da başlıyor.`;
      }

      await addNotificationJob({
        userId: user.id,
        type: 'event',
        title: title,
        message: message,
        link: `/meetings/${meeting.id}`,
        metadata: {
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          startDate: meeting.start_date,
          location: meeting.location,
          meetingLink: meeting.meeting_link,
          meetingType: meeting.meeting_type,
          reminderType: reminderType,
        },
      });

      await addEmailJob({
        to: user.email,
        subject: `${title}: ${meeting.title}`,
        html: `
          <h1>${title}</h1>
          <p>Merhaba ${user.first_name},</p>
          <p><strong>${meeting.title}</strong> toplantınız ${reminderType.toLowerCase()}:</p>
          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Tarih:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${dateStr}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Saat:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${timeStr}</td>
            </tr>
            ${meeting.location ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Yer:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${meeting.location}</td>
            </tr>
            ` : ''}
            ${meeting.meeting_link ? `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Toplantı Linki:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;"><a href="${meeting.meeting_link}" target="_blank">Katıl</a></td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Tip:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${meeting.meeting_type}</td>
            </tr>
          </table>
          <br>
          <a href="${process.env.CLIENT_URL}/meetings/${meeting.id}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Toplantıyı Görüntüle
          </a>
          <br><br>
          <p style="color: #666; font-size: 12px;">Bu hatırlatma otomatik olarak gönderilmiştir.</p>
        `,
      });

      logger.info(`✅ Meeting reminder sent to ${user.email}: ${reminderType}`);
    } catch (error) {
      logger.error(`❌ Failed to send meeting reminder to ${user?.email}:`, error);
    }
  }

  // ============================================
  // ✅ TASK REMINDER - ÇİFT HATIRLATMA (1 GÜN + 1 SAAT)
  // ============================================
  async checkUpcomingTasks() {
    try {
      const now = new Date();
      
      const tasks = await Task.findAll({
        where: {
          status: {
            [Op.notIn]: ['completed', 'cancelled'],
          },
          due_date: {
            [Op.ne]: null,
          },
        },
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
      });

      console.log(`📊 Toplam ${tasks?.length || 0} görev bulundu`);

      for (const task of tasks) {
        const dueDate = new Date(task.due_date);
        const diffHours = (dueDate - now) / (1000 * 60 * 60);

        console.log(`📅 Görev: ${task.title}, Son Tarih: ${dueDate}`);
        console.log(`⏰ Fark: ${diffHours.toFixed(2)} saat`);

        const user = task.assignee;
        if (!user) continue;

        // ✅ 1. HATIRLATMA: 1 GÜN ÖNCE (23.5 - 24 saat arası)
        if (
          diffHours <= 24 &&
          diffHours > 23.5 &&
          !task.reminder_sent_1
        ) {
          console.log(`✅ 1. hatırlatma gönderiliyor: ${task.title}`);
          await this.sendTaskReminder(user, task, '1 Gün Önce');
          await task.update({ 
            reminder_sent_1: true,
            reminder_sent_at_1: now,
          });
          logger.info(`✅ Task 1-day reminder sent: ${task.id} (${task.title})`);
        }

        // ✅ 2. HATIRLATMA: 1 SAAT ÖNCE (0 - 1 saat arası)
        if (
          diffHours <= 1 &&
          diffHours > 0 &&
          !task.reminder_sent_2
        ) {
          console.log(`✅ 2. hatırlatma gönderiliyor: ${task.title}`);
          await this.sendTaskReminder(user, task, '1 Saat Önce');
          await task.update({ 
            reminder_sent_2: true,
            reminder_sent_at_2: now,
          });
          logger.info(`✅ Task 1-hour reminder sent: ${task.id} (${task.title})`);
        }
      }
    } catch (error) {
      logger.error('❌ Task reminder job error:', error);
    }
  }

  // ✅ TASK REMINDER GÖNDERME YARDIMCI METODU
  async sendTaskReminder(user, task, reminderType) {
    try {
      const dueDate = new Date(task.due_date);
      
      const dateStr = `${String(dueDate.getUTCDate()).padStart(2, '0')}.${String(
        dueDate.getUTCMonth() + 1
      ).padStart(2, '0')}.${dueDate.getUTCFullYear()}`;
      
      const timeStr = `${String(dueDate.getUTCHours()).padStart(2, '0')}:${String(
        dueDate.getUTCMinutes()
      ).padStart(2, '0')}`;

      let title, message;
      if (reminderType === '1 Gün Önce') {
        title = '📋 Görev Hatırlatması (1 Gün Kaldı)';
        message = `"${task.title}" görevinin son tarihi yarın ${dateStr} tarihinde saat ${timeStr}'da.`;
      } else {
        title = '📋 Görev Hatırlatması (1 Saat Kaldı)';
        message = `"${task.title}" görevinin son tarihi 1 saat sonra ${dateStr} tarihinde saat ${timeStr}'da.`;
      }

      await addNotificationJob({
        userId: user.id,
        type: 'task',
        title: title,
        message: message,
        link: `/tasks/${task.id}`,
        metadata: {
          taskId: task.id,
          taskTitle: task.title,
          dueDate: task.due_date,
          priority: task.priority,
          reminderType: reminderType,
        },
      });

      await addEmailJob({
        to: user.email,
        subject: `${title}: ${task.title}`,
        html: `
          <h1>${title}</h1>
          <p>Merhaba ${user.first_name},</p>
          <p><strong>${task.title}</strong> görevinin son tarihi ${reminderType.toLowerCase()}:</p>
          <p><strong>Son Tarih:</strong> ${dateStr} ${timeStr}</p>
          <p><strong>Öncelik:</strong> ${task.priority}</p>
          <a href="${process.env.CLIENT_URL}/tasks/${task.id}">Görevi Görüntüle</a>
        `,
      });

      logger.info(`✅ Task reminder sent to ${user.email}: ${reminderType}`);
    } catch (error) {
      logger.error(`❌ Failed to send task reminder to ${user?.email}:`, error);
    }
  }

  // ============================================
  // ✅ EVENT REMINDER - ÇİFT HATIRLATMA (1 GÜN + 1 SAAT)
  // ============================================
  async checkUpcomingEvents() {
    try {
      const now = new Date();
      
      const events = await Event.findAll({
        where: {
          status: 'scheduled',
          start_date: {
            [Op.ne]: null,
          },
        },
        include: [
          {
            model: User,
            as: 'assignedTo',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
      });

      console.log(`📊 Toplam ${events?.length || 0} etkinlik bulundu`);

      for (const event of events) {
        const startDate = new Date(event.start_date);
        const diffHours = (startDate - now) / (1000 * 60 * 60);

        console.log(`📅 Etkinlik: ${event.title}, Başlangıç: ${startDate}`);
        console.log(`⏰ Fark: ${diffHours.toFixed(2)} saat`);

        const user = event.assignedTo;
        if (!user) continue;

        // ✅ 1. HATIRLATMA: 1 GÜN ÖNCE (23.5 - 24 saat arası)
        if (
          diffHours <= 24 &&
          diffHours > 23.5 &&
          !event.reminder_sent_1
        ) {
          console.log(`✅ 1. hatırlatma gönderiliyor: ${event.title}`);
          await this.sendEventReminder(user, event, '1 Gün Önce');
          await event.update({ 
            reminder_sent_1: true,
            reminder_sent_at_1: now,
          });
          logger.info(`✅ Event 1-day reminder sent: ${event.id} (${event.title})`);
        }

        // ✅ 2. HATIRLATMA: 1 SAAT ÖNCE (0 - 1 saat arası)
        if (
          diffHours <= 1 &&
          diffHours > 0 &&
          !event.reminder_sent_2
        ) {
          console.log(`✅ 2. hatırlatma gönderiliyor: ${event.title}`);
          await this.sendEventReminder(user, event, '1 Saat Önce');
          await event.update({ 
            reminder_sent_2: true,
            reminder_sent_at_2: now,
          });
          logger.info(`✅ Event 1-hour reminder sent: ${event.id} (${event.title})`);
        }
      }
    } catch (error) {
      logger.error('❌ Event reminder job error:', error);
    }
  }

  // ✅ EVENT REMINDER GÖNDERME YARDIMCI METODU
  async sendEventReminder(user, event, reminderType) {
    try {
      const startDate = new Date(event.start_date);
      
      const dateStr = `${String(startDate.getUTCDate()).padStart(2, '0')}.${String(
        startDate.getUTCMonth() + 1
      ).padStart(2, '0')}.${startDate.getUTCFullYear()}`;
      
      const timeStr = `${String(startDate.getUTCHours()).padStart(2, '0')}:${String(
        startDate.getUTCMinutes()
      ).padStart(2, '0')}`;

      let title, message;
      if (reminderType === '1 Gün Önce') {
        title = '📅 Etkinlik Hatırlatması (1 Gün Kaldı)';
        message = `"${event.title}" etkinliği yarın ${dateStr} tarihinde saat ${timeStr}'da.`;
      } else {
        title = '📅 Etkinlik Hatırlatması (1 Saat Kaldı)';
        message = `"${event.title}" etkinliği 1 saat sonra ${dateStr} tarihinde saat ${timeStr}'da başlıyor.`;
      }

      await addNotificationJob({
        userId: user.id,
        type: 'event',
        title: title,
        message: message,
        link: `/events/${event.id}`,
        metadata: {
          eventId: event.id,
          eventTitle: event.title,
          startDate: event.start_date,
          location: event.location,
          reminderType: reminderType,
        },
      });

      await addEmailJob({
        to: user.email,
        subject: `${title}: ${event.title}`,
        html: `
          <h1>${title}</h1>
          <p>Merhaba ${user.first_name},</p>
          <p><strong>${event.title}</strong> etkinliği ${reminderType.toLowerCase()}:</p>
          <p><strong>Tarih:</strong> ${dateStr} ${timeStr}</p>
          ${event.location ? `<p><strong>Yer:</strong> ${event.location}</p>` : ''}
          <a href="${process.env.CLIENT_URL}/events/${event.id}">Etkinliği Görüntüle</a>
        `,
      });

      logger.info(`✅ Event reminder sent to ${user.email}: ${reminderType}`);
    } catch (error) {
      logger.error(`❌ Failed to send event reminder to ${user?.email}:`, error);
    }
  }

  // ============================================
  // ✅ OVERDUE TASKS
  // ============================================
  async checkOverdueTasks() {
    try {
      const now = new Date();

      const tasks = await Task.findAll({
        where: {
          due_date: {
            [Op.lt]: now,
          },
          status: {
            [Op.notIn]: ['completed', 'cancelled'],
          },
        },
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
      });

      for (const task of tasks) {
        const user = task.assignee;
        if (!user) continue;

        const daysOverdue = Math.floor((now - new Date(task.due_date)) / (1000 * 60 * 60 * 24));

        await addNotificationJob({
          userId: user.id,
          type: 'task',
          title: '⚠️ Gecikmiş Görev',
          message: `"${task.title}" görevi ${daysOverdue} gündür gecikti!`,
          link: `/tasks/${task.id}`,
          metadata: {
            taskId: task.id,
            taskTitle: task.title,
            dueDate: task.due_date,
            daysOverdue,
            priority: task.priority,
          },
        });

        await addEmailJob({
          to: user.email,
          subject: `⚠️ Gecikmiş Görev: ${task.title}`,
          html: `
            <h1>Gecikmiş Görev Uyarısı</h1>
            <p>Merhaba ${user.first_name},</p>
            <p><strong>${task.title}</strong> görevi ${daysOverdue} gündür gecikti!</p>
            <p><strong>Son Tarih:</strong> ${new Date(task.due_date).toLocaleString('tr-TR')}</p>
            <p><strong>Gecikme:</strong> ${daysOverdue} gün</p>
            <a href="${process.env.CLIENT_URL}/tasks/${task.id}">Görevi Görüntüle</a>
          `,
        });

        logger.info(`⚠️ Overdue notification sent for task: ${task.id} (${daysOverdue} days)`);
      }
    } catch (error) {
      logger.error('❌ Overdue task job error:', error);
    }
  }

  // ============================================
  // ✅ DAILY SUMMARY
  // ============================================
  async sendDailySummary() {
    try {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tasksToday = await Task.findAll({
        where: {
          due_date: {
            [Op.between]: [today, tomorrow],
          },
          status: {
            [Op.notIn]: ['completed', 'cancelled'],
          },
        },
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
      });

      const userTasks = {};
      for (const task of tasksToday) {
        const userId = task.assigned_to;
        if (!userId) continue;
        if (!userTasks[userId]) {
          userTasks[userId] = {
            user: task.assignee,
            tasks: [],
          };
        }
        userTasks[userId].tasks.push(task);
      }

      for (const [userId, data] of Object.entries(userTasks)) {
        const { user, tasks } = data;
        if (!user) continue;

        const taskList = tasks.map(t =>
          `<li>${t.title} - ${t.priority} öncelik</li>`
        ).join('');

        await addEmailJob({
          to: user.email,
          subject: '📋 Günlük Görev Özeti',
          html: `
            <h1>Günlük Görev Özeti</h1>
            <p>Merhaba ${user.first_name},</p>
            <p>Bugün tamamlaman gereken ${tasks.length} görev var:</p>
            <ul>${taskList}</ul>
            <a href="${process.env.CLIENT_URL}/tasks">Tüm Görevleri Görüntüle</a>
          `,
        });

        logger.info(`📋 Daily summary sent to: ${user.email}`);
      }
    } catch (error) {
      logger.error('❌ Daily summary job error:', error);
    }
  }

  // ============================================
  // ✅ WEEKLY SUMMARY
  // ============================================
  async sendWeeklySummary() {
    try {
      logger.info('📊 Weekly summary job executed');
    } catch (error) {
      logger.error('❌ Weekly summary job error:', error);
    }
  }

  stop() {
    this.isRunning = false;
    logger.info('⏹️ Reminder jobs stopped');
  }
}

export const reminderJob = new ReminderJob();
export default reminderJob;
// server/src/models/Task.js
import { Sequelize, DataTypes } from 'sequelize';

class Task extends Sequelize.Model {
  static initModel(sequelize) {
    Task.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        
        // ============ DURUM ============
        status: {
          type: DataTypes.ENUM(
            'draft',        // Taslak
            'pending',      // Bekliyor (atandı ama kabul edilmedi)
            'accepted',     // Kabul edildi
            'rejected',     // Reddedildi
            'in_progress',  // Devam ediyor
            'review',       // İncelemede
            'completed',    // Tamamlandı
            'cancelled',    // İptal
            'archived'      // Arşivlendi
          ),
          defaultValue: 'draft',
        },
        priority: {
          type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
          defaultValue: 'medium',
        },
        progress: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          validate: { min: 0, max: 100 },
        },

        // ============ TARİHLER ============
        due_date: { type: DataTypes.DATE, allowNull: true },
        start_date: { type: DataTypes.DATE, allowNull: true },
        completed_at: { type: DataTypes.DATE, allowNull: true },
        estimated_hours: { type: DataTypes.FLOAT, defaultValue: 0 },
        spent_hours: { type: DataTypes.FLOAT, defaultValue: 0 },

        // ============ ATAMA ============
        assigned_to: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' },
        },
        assigned_by: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' },
        },
        assigned_at: { type: DataTypes.DATE, allowNull: true },

        // ============ KABUL/RED ============
        accepted_at: { type: DataTypes.DATE, allowNull: true },
        rejected_at: { type: DataTypes.DATE, allowNull: true },
        rejection_reason: { type: DataTypes.TEXT, allowNull: true },

        // ============ İLİŞKİLER ============
        case_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'cases', key: 'id' },
        },
        client_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'clients', key: 'id' },
        },
        parent_task_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'tasks', key: 'id' },
        },
        created_by: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },

        // ============ TEKRARLAYAN ============
        is_recurring: { type: DataTypes.BOOLEAN, defaultValue: false },
        recurrence_type: {
          type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
          allowNull: true,
        },
        recurrence_end_date: { type: DataTypes.DATE, allowNull: true },

        // ============ ETİKETLER ============
        tags: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          defaultValue: [],
        },

        // ============ HATIRLATMA ============
        reminder_date: { type: DataTypes.DATE, allowNull: true },
        reminder_sent: { type: DataTypes.BOOLEAN, defaultValue: false },
        reminder_sent_1: { type: DataTypes.BOOLEAN, defaultValue: false },
        reminder_sent_at_1: { type: DataTypes.DATE, allowNull: true },
        reminder_sent_2: { type: DataTypes.BOOLEAN, defaultValue: false },
        reminder_sent_at_2: { type: DataTypes.DATE, allowNull: true },

        // ============ SİSTEM ============
        deleted_at: { type: DataTypes.DATE, allowNull: true },
      },
      {
        sequelize,
        tableName: 'tasks',
        paranoid: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
  }

  static associate(models) {
    // ============ KULLANICI İLİŞKİLERİ ============
    Task.belongsTo(models.User, {
      foreignKey: 'assigned_to',
      as: 'assignee',      // Atanan kişi
    });
    Task.belongsTo(models.User, {
      foreignKey: 'assigned_by',
      as: 'assigner',      // Atayan kişi
    });
    Task.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',       // Oluşturan kişi
    });

    // ============ DAVA / MÜVEKKİL ============
    Task.belongsTo(models.Case, {
      foreignKey: 'case_id',
      as: 'case',
    });
    Task.belongsTo(models.Client, {
      foreignKey: 'client_id',
      as: 'client',
    });

    // ============ ALT GÖREVLER ============
    Task.belongsTo(Task, {
      foreignKey: 'parent_task_id',
      as: 'parentTask',
    });
    Task.hasMany(Task, {
      foreignKey: 'parent_task_id',
      as: 'subtasks',
    });
  }
}

export { Task };
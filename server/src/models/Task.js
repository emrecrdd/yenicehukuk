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
        status: {
          type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
          defaultValue: 'pending',
        },
        priority: {
          type: DataTypes.ENUM('low', 'normal', 'high', 'critical'),
          defaultValue: 'normal',
        },
        due_date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        completed_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        assigned_to: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        created_by: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        case_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'cases',
            key: 'id',
          },
        },
        client_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'clients',
            key: 'id',
          },
        },
        parent_task_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'tasks',
            key: 'id',
          },
        },
        reminder_date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        reminder_sent: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        progress: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          validate: {
            min: 0,
            max: 100,
          },
        },
        tags: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          defaultValue: [],
        },
        // ✅ YENİ REMINDER ALANLARI (1 GÜN + 1 SAAT)
        reminder_sent_1: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        reminder_sent_at_1: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        reminder_sent_2: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        reminder_sent_at_2: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'tasks',
        paranoid: true,
        timestamps: true,
      }
    );
  }

  // ✅ İLİŞKİLER
  static associate(models) {
    Task.belongsTo(models.User, {
      foreignKey: 'assigned_to',
      as: 'assignee',
    });
    Task.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
    Task.belongsTo(models.Case, {
      foreignKey: 'case_id',
      as: 'case',
    });
    Task.belongsTo(models.Client, {
      foreignKey: 'client_id',
      as: 'client',
    });
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
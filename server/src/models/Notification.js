import { Sequelize, DataTypes } from 'sequelize';

class Notification extends Sequelize.Model {
  static initModel(sequelize) {
    Notification.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM('task', 'case', 'event','meeting', 'system'),
          defaultValue: 'system',
        },
        read: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        link: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        metadata: {
          type: DataTypes.JSONB,
          defaultValue: {},
        },
        // ✅ TIMESTAMPS (Sequelize otomatik ekler ama paranoid için gerekli)
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'notifications',
        paranoid: true,      // ✅ Soft delete için
        timestamps: true,    // ✅ createdAt, updatedAt otomatik
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
      }
    );
  }

  static associate(models) {
    Notification.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  }
}

export { Notification };
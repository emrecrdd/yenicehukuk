import { Sequelize, DataTypes } from 'sequelize';
class AuditLog extends Sequelize.Model {
  static initModel(sequelize) {
    AuditLog.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        action: {
          type: DataTypes.ENUM(
            'create',
            'update',
            'delete',
            'view',
            'login',
            'logout',
            'upload',
            'download',
            'share'
          ),
          allowNull: false,
        },
        entity_type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        entity_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        old_values: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        new_values: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        ip_address: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        user_agent: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        metadata: {
          type: DataTypes.JSONB,
          defaultValue: {},
        },
      },
      {
        sequelize,
        tableName: 'audit_logs',
      }
    );
  }
}

export { AuditLog };
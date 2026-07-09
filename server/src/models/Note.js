import { Sequelize, DataTypes } from 'sequelize';
class Note extends Sequelize.Model {
  static initModel(sequelize) {
    Note.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        note_type: {
          type: DataTypes.ENUM('general', 'meeting', 'phone', 'email', 'reminder'),
          defaultValue: 'general',
        },
        is_private: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        is_pinned: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        client_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'clients',
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
        created_by: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        tags: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          defaultValue: [],
        },
        metadata: {
          type: DataTypes.JSONB,
          defaultValue: {},
        },
      },
      {
        sequelize,
        tableName: 'notes',
      }
    );
  }
}

export { Note };
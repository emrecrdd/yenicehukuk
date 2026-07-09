import { Sequelize, DataTypes } from 'sequelize';
import { CASE_STATUS } from '../constants/caseStatus.js';

class Case extends Sequelize.Model {
  static initModel(sequelize) {
    Case.init(
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
        case_number: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        decision_number: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        court_name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        court_type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        case_type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        subject: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM(...Object.values(CASE_STATUS)),
          defaultValue: CASE_STATUS.PREPARATION,
        },
        opening_date: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        closing_date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        client_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'clients',
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
        assigned_to: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        priority: {
          type: DataTypes.ENUM('low', 'normal', 'high', 'critical'),
          defaultValue: 'normal',
        },
        estimated_value: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: true,
        },
        is_confidential: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: 'cases',
      }
    );
  }
}

export { Case };
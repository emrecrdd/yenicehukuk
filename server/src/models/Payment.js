import { Sequelize, DataTypes } from 'sequelize';
class Payment extends Sequelize.Model {
  static initModel(sequelize) {
    Payment.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        amount: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: false,
          validate: {
            min: 0,
          },
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        payment_type: {
          type: DataTypes.ENUM('agreed', 'received', 'refund', 'expense'),
          defaultValue: 'received',
        },
        payment_method: {
          type: DataTypes.ENUM('cash', 'bank_transfer', 'credit_card', 'check', 'other'),
          defaultValue: 'cash',
        },
        status: {
          type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'refund'),
          defaultValue: 'pending',
        },
        payment_date: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        due_date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        transaction_id: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        receipt_number: {
          type: DataTypes.STRING,
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
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'payments',
      }
    );
  }
}

export { Payment };
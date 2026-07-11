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
        // ✅ YARGI BİLGİLERİ (Formdan gelenler)
        judiciary_type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        judiciary_unit: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        opening_date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        court_name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        case_number: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        // ❌ KALDIRILAN ALANLAR
        // decision_number: KALDIRILDI
        // court_type: KALDIRILDI
        // case_type: KALDIRILDI
        // closing_date: KALDIRILDI
        // client_id: KALDIRILDI (çoklu müvekkil için)
        // estimated_value: KALDIRILDI
        // is_confidential: KALDIRILDI

        // ✅ ESKİ ALANLAR (KALANLAR)
        title: {
          type: DataTypes.STRING,
          allowNull: false,
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
      },
      {
        sequelize,
        tableName: 'cases',
        timestamps: true,
        paranoid: true,
      }
    );
  }

  static associate(models) {
    // ✅ ÇOKLU MÜVEKKİL İLİŞKİSİ (N-N)
    Case.belongsToMany(models.Client, {
      through: 'case_clients',
      foreignKey: 'case_id',
      otherKey: 'client_id',
      as: 'clients',
    });

    // 👤 KULLANICI İLİŞKİLERİ
    Case.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
    Case.belongsTo(models.User, {
      foreignKey: 'assigned_to',
      as: 'assignee',
    });

    // 📄 ALT MODÜLLER
    Case.hasMany(models.Task, {
      foreignKey: 'case_id',
      as: 'tasks',
    });
    Case.hasMany(models.Event, {
      foreignKey: 'case_id',
      as: 'events',
    });
    Case.hasMany(models.Document, {
      foreignKey: 'case_id',
      as: 'documents',
    });
    Case.hasMany(models.Note, {
      foreignKey: 'case_id',
      as: 'notes',
    });
    Case.hasMany(models.Payment, {
      foreignKey: 'case_id',
      as: 'payments',
    });
    Case.hasMany(models.Meeting, {
      foreignKey: 'case_id',
      as: 'meetings',
    });
    Case.hasMany(models.PowerOfAttorney, {
      foreignKey: 'case_id',
      as: 'powerOfAttorneys',
    });
  }
}

export { Case };
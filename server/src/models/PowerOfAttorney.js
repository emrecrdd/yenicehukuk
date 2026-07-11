import { Sequelize, DataTypes } from 'sequelize';

class PowerOfAttorney extends Sequelize.Model {
  static initModel(sequelize) {
    PowerOfAttorney.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        // ✅ Müvekkil (ZORUNLU)
        client_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'clients',
            key: 'id',
          },
        },
        // ✅ Dava (OPSİYONEL)
        case_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'cases',
            key: 'id',
          },
        },
        // ✅ Vekaletname Başlığı
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        // ✅ Vekaletname Açıklaması
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        // ✅ Vekaletname Dosyası (PDF/Word)
        file_url: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        file_name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        file_size: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        file_type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        // ✅ Başlangıç Tarihi
        start_date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        // ✅ Bitiş Tarihi
        end_date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        // ✅ Durum
        status: {
          type: DataTypes.ENUM('active', 'expired', 'cancelled'),
          defaultValue: 'active',
        },
        // ✅ Yetkiler (JSON Array)
        authorities: {
          type: DataTypes.JSON,
          defaultValue: [],
        },
        // ✅ Notlar
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        // ✅ Oluşturan
        created_by: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
      },
      {
        sequelize,
        tableName: 'power_of_attorneys',
        paranoid: true,
        timestamps: true,
      }
    );
  }

  static associate(models) {
    PowerOfAttorney.belongsTo(models.Client, {
      foreignKey: 'client_id',
      as: 'client',
    });
    PowerOfAttorney.belongsTo(models.Case, {
      foreignKey: 'case_id',
      as: 'case',
    });
    PowerOfAttorney.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
    // ✅ Document ilişkisi - EKLENDI
    PowerOfAttorney.hasMany(models.Document, {
      foreignKey: 'power_of_attorney_id',
      as: 'documents',
    });
  }
}

export { PowerOfAttorney };
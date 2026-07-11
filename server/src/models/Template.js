import { Sequelize, DataTypes } from 'sequelize';

class Template extends Sequelize.Model {
  static initModel(sequelize) {
    Template.init(
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
        // ✅ Kategori: 'dilekce', 'ihtar', 'sozlesme'
        category: {
          type: DataTypes.ENUM('dilekce', 'ihtar', 'sozlesme'),
          allowNull: false,
        },
        // ✅ Hukuk Alanı: 'ozel_hukuk', 'ceza_hukuku', 'idare_hukuku', 'ofis_ici'
        law_area: {
          type: DataTypes.ENUM('ozel_hukuk', 'ceza_hukuku', 'idare_hukuku', 'ofis_ici'),
          allowNull: false,
        },
        // ✅ Dosya (PDF/Word)
        file_url: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        file_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        file_size: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        file_type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        // ✅ Versiyon
        version: {
          type: DataTypes.INTEGER,
          defaultValue: 1,
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
        // ✅ Güncelleyen
        updated_by: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        // ✅ İndirme sayısı
        download_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
      },
      {
        sequelize,
        tableName: 'templates',
        timestamps: true,
        paranoid: true,
      }
    );
  }

  static associate(models) {
    Template.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
    Template.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater',
    });
  }
}

export { Template };
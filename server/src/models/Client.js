import { Sequelize, DataTypes } from 'sequelize';

class Client extends Sequelize.Model {
  static initModel(sequelize) {
    Client.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        // ✅ Ad Soyad / Unvan (tek alan)
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        // ✅ TCKNO / VKN (tek alan)
        identification_number: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,  // ✅ EKLENDI - Benzersiz
          validate: {
            isEmail: true,
          },
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,  // ✅ EKLENDI - Benzersiz
        },
        address: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        city: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        district: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        postal_code: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        tags: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          defaultValue: [],
        },
        // ✅ Müvekkil Türü (Bireysel/Kurumsal)
        client_type: {
          type: DataTypes.ENUM('individual', 'corporate'),
          defaultValue: 'individual',
        },
        status: {
          type: DataTypes.ENUM('active', 'passive', 'archived'),
          defaultValue: 'active',
        },
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
        tableName: 'clients',
        paranoid: true,
        timestamps: true,
      }
    );
  }

  // ✅ fullName virtual getter
  get fullName() {
    return this.name || 'İsimsiz Müvekkil';
  }

  // ✅ toJSON override
  toJSON() {
    const values = { ...this.get() };
    values.fullName = this.fullName;
    return values;
  }

  static associate(models) {
    Client.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
    Client.hasMany(models.Case, {
      foreignKey: 'client_id',
      as: 'cases',
    });
    Client.hasMany(models.Meeting, {
      foreignKey: 'client_id',
      as: 'meetings',
    });
    Client.hasMany(models.Task, {
      foreignKey: 'client_id',
      as: 'tasks',
    });
    Client.hasMany(models.Document, {
      foreignKey: 'client_id',
      as: 'documents',
    });
    // ✅ Vekaletname ilişkisi
    Client.hasMany(models.PowerOfAttorney, {
      foreignKey: 'client_id',
      as: 'powerOfAttorneys',
    });
  }
}

export { Client };
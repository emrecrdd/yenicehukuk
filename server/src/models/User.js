import { Sequelize, DataTypes } from 'sequelize';  // ✅ Sequelize eklendi
import { ROLES } from '../constants/roles.js';
import bcrypt from 'bcryptjs';

class User extends Sequelize.Model {
  static initModel(sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
            notEmpty: true,
          },
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        first_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        last_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        role: {
          type: DataTypes.ENUM(...Object.values(ROLES)),
          defaultValue: ROLES.INTERN,  // ROLES.STAJYER yerine ROLES.INTERN
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        last_login: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        refresh_token: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        avatar: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        bio: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        email_verified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        email_verification_token: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        password_reset_token: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        password_reset_expires: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'users',
        hooks: {
          beforeCreate: async (user) => {
            if (user.password) {
              const salt = await bcrypt.genSalt(10);
              user.password = await bcrypt.hash(user.password, salt);
            }
          },
          beforeUpdate: async (user) => {
            if (user.changed('password')) {
              const salt = await bcrypt.genSalt(10);
              user.password = await bcrypt.hash(user.password, salt);
            }
          },
        },
      }
    );
  }

  async comparePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.refresh_token;
    delete values.email_verification_token;
    delete values.password_reset_token;
    delete values.password_reset_expires;
    return values;
  }
}

export { User };
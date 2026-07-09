import { User } from '../../models/User.js';

export const authRepository = {
  findByEmail: (email) => {
    return User.findOne({ where: { email } });
  },

  findById: (id) => {
    return User.findByPk(id, {
      attributes: { exclude: ['password', 'refresh_token', 'email_verification_token', 'password_reset_token', 'password_reset_expires'] },
    });
  },

  create: (userData) => {
    return User.create(userData);
  },

  updateRefreshToken: (userId, refreshToken) => {
    return User.update({ refresh_token: refreshToken }, { where: { id: userId } });
  },

  findByRefreshToken: (refreshToken) => {
    return User.findOne({ where: { refresh_token: refreshToken } });
  },

  invalidateRefreshToken: (refreshToken) => {
    return User.update({ refresh_token: null }, { where: { refresh_token: refreshToken } });
  },

  invalidateAllRefreshTokens: (userId) => {
    return User.update({ refresh_token: null }, { where: { id: userId } });
  },

  savePasswordResetToken: (userId, token, expires) => {
    return User.update(
      { password_reset_token: token, password_reset_expires: expires },
      { where: { id: userId } }
    );
  },

  findByPasswordResetToken: (token) => {
    return User.findOne({ where: { password_reset_token: token } });
  },
};
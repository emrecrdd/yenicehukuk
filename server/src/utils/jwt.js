import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};
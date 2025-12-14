// ============================================
// 📄 FILENAME: jwt.ts
// 📍 PATH: backend/src/utils/jwt.ts
// ============================================

import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRE }
  );
};

export const generateRefreshToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRE }
  );
};

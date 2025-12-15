// ============================================
// 📄 FILENAME: jwt.ts (FIXED)
// 📍 PATH: backend/src/utils/jwt.ts
// ============================================

import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const generateToken = (user: any): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRE } as jwt.SignOptions  // ✅ تم التصحيح
  );
};

export const generateRefreshToken = (user: any): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRE } as jwt.SignOptions  // ✅ تم التصحيح
  );
};

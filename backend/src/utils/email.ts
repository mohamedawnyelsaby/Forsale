// ============================================
// 📄 FILENAME: email.ts (FIXED)
// 📍 PATH: backend/src/utils/email.ts
// ============================================

import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { logger } from './logger';

const transporter = nodemailer.createTransport({  // ✅ تم التصحيح من createTransporter
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS
  }
});

export const sendEmail = async (options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  try {
    await transporter.sendMail({
      from: config.SMTP_USER,
      ...options
    });
    logger.info(`Email sent to ${options.to}`);
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};

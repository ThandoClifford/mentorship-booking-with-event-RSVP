import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ump_mentorship_portal',
  jwtSecret: process.env.JWT_SECRET || 'change_this_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  appUrl: process.env.APP_URL || 'http://localhost:5174',
  mailEnabled: String(process.env.MAIL_ENABLED || 'true').toLowerCase() !== 'false',
  mailHost: process.env.MAIL_HOST || '',
  mailPort: Number(process.env.MAIL_PORT || 587),
  mailSecure: String(process.env.MAIL_SECURE || 'false').toLowerCase() === 'true',
  mailUser: process.env.MAIL_USER || '',
  mailPass: process.env.MAIL_PASS || '',
  mailFromAddress: process.env.MAIL_FROM_ADDRESS || '',
  mailFromName: process.env.MAIL_FROM_NAME || 'The Mentorship Academy',
  adminNotifyEmails: String(process.env.ADMIN_NOTIFY_EMAILS || '')
    .split(',')
    .map((email) => String(email || '').trim())
    .filter(Boolean)
};

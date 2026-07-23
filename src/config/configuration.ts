export default () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  API_URL: process.env.API_URL || 'http://localhost:3000',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'change-me-32-byte-hex-key-for-aes-256-gcm',
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
});

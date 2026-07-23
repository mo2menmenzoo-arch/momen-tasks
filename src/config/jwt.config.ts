export default () => ({
  JWT_CONFIG: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'change-me-to-a-long-random-string',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-to-another-long-random-string',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
});

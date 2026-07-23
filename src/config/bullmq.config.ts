export default () => ({
  BULLMQ_CONFIG: {
    connection: {
      host: process.env.REDIS_URL?.replace('redis://', '').split(':')[0] || 'localhost',
      port: parseInt(process.env.REDIS_URL?.replace('redis://', '').split(':')[1] || '6379', 10),
      password: process.env.REDIS_TOKEN || undefined,
      tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined,
    },
  },
});

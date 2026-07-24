import express from 'express';

const app = express();

app.get('/api/test', (_req: any, res: any) => {
  res.json({ success: true, env: process.env.NODE_ENV, hasDb: !!process.env.DATABASE_URL });
});

export default app;

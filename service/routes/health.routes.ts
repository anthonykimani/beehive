import { Router, Request, Response } from 'express';
import { AppDataSource } from '../configs/orm.config';

export const healthRouter = Router();

healthRouter.get('/', async (req: Request, res: Response) => {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'swarmfund-api',
    version: '1.0.0',
    checks: {
      database: 'unknown',
    },
  };

  try {
    await AppDataSource.query('SELECT 1');
    checks.checks.database = 'ok';
  } catch (error) {
    checks.checks.database = 'error';
    checks.status = 'degraded';
  }

  const allOk = Object.values(checks.checks).every((v) => v === 'ok');
  res.status(allOk ? 200 : 503).json(checks);
});

healthRouter.get('/ready', async (req: Request, res: Response) => {
  res.json({ ready: true });
});

healthRouter.get('/live', (req: Request, res: Response) => {
  res.json({ alive: true });
});

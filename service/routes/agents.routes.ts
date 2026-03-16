import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

export const agentsRouter = Router();

agentsRouter.get('/', authMiddleware, async (req, res: Response, next) => {
  try {
    res.json({
      success: true,
      data: {
        agents: [],
        total: 0,
        page: 1,
        limit: 20,
      },
    });
  } catch (error) {
    next(error);
  }
});

agentsRouter.get('/:agentId', authMiddleware, async (req, res: Response, next) => {
  try {
    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

agentsRouter.post('/', authMiddleware, async (req, res: Response, next) => {
  try {
    res.json({
      success: true,
      data: { id: 'placeholder' },
    });
  } catch (error) {
    next(error);
  }
});

agentsRouter.patch('/:agentId', authMiddleware, async (req, res: Response, next) => {
  try {
    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

agentsRouter.delete('/:agentId', authMiddleware, async (req, res: Response, next) => {
  try {
    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

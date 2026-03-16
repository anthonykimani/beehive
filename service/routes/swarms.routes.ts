import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../configs/orm.config';
import { Swarm } from '../models/swarm.entity';
import { SwarmRepository } from '../repositories/swarm.repo';
import { ApiError } from '../middleware/error-handler';

export const swarmsRouter = Router();

swarmsRouter.get('/', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const swarmRepo = AppDataSource.getCustomRepository(SwarmRepository);
    const result = await swarmRepo.findAllPublic(pageNum, limitNum);

    res.json({
      success: true,
      data: { swarms: result.swarms, total: result.total },
    });
  } catch (error) {
    next(error);
  }
});

swarmsRouter.get('/:swarmId', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { swarmId } = req.params;
    const swarmRepo = AppDataSource.getCustomRepository(SwarmRepository);
    const swarm = await swarmRepo.findById(swarmId);

    if (!swarm) {
      throw new Error('Swarm not found') as ApiError;
    }

    res.json({ success: true, data: swarm });
  } catch (error) {
    next(error);
  }
});

swarmsRouter.post('/', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, description, isPublic, agents } = req.body;

    if (!req.userId) {
      throw new Error('User required') as ApiError;
    }

    const swarmRepository = AppDataSource.getRepository(Swarm);
    const swarm = swarmRepository.create({
      creatorId: req.userId,
      name,
      description,
      isPublic: isPublic || false,
      agents: agents || [],
    });

    await swarmRepository.save(swarm);

    res.json({ success: true, data: swarm });
  } catch (error) {
    next(error);
  }
});

swarmsRouter.patch('/:swarmId', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { swarmId } = req.params;
    const { name, description, isPublic, agents } = req.body;

    const swarmRepo = AppDataSource.getCustomRepository(SwarmRepository);
    const swarm = await swarmRepo.findById(swarmId);

    if (!swarm) {
      throw new Error('Swarm not found') as ApiError;
    }

    if (swarm.creatorId !== req.userId) {
      throw new Error('Not authorized to update this swarm') as ApiError;
    }

    const swarmRepository = AppDataSource.getRepository(Swarm);
    if (name) swarm.name = name;
    if (description !== undefined) swarm.description = description;
    if (isPublic !== undefined) swarm.isPublic = isPublic;
    if (agents) swarm.agents = agents;

    await swarmRepository.save(swarm);

    res.json({ success: true, data: swarm });
  } catch (error) {
    next(error);
  }
});

swarmsRouter.delete('/:swarmId', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { swarmId } = req.params;

    const swarmRepo = AppDataSource.getCustomRepository(SwarmRepository);
    const swarm = await swarmRepo.findById(swarmId);

    if (!swarm) {
      throw new Error('Swarm not found') as ApiError;
    }

    if (swarm.creatorId !== req.userId) {
      throw new Error('Not authorized to delete this swarm') as ApiError;
    }

    const swarmRepository = AppDataSource.getRepository(Swarm);
    await swarmRepository.remove(swarm);

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
});

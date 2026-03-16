import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../configs/orm.config';
import { Agent, AgentCategory, PricingModel } from '../models/agent.entity';
import { AgentRepository } from '../repositories/agent.repo';
import { ApiError } from '../middleware/error-handler';

export const agentsRouter = Router();

agentsRouter.get('/', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { category, search, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const agentRepo = AppDataSource.getCustomRepository(AgentRepository);
    let result;
    
    if (search) {
      result = await agentRepo.search(search as string, pageNum, limitNum);
    } else if (category) {
      result = await agentRepo.findByCategory(category as AgentCategory, pageNum, limitNum);
    } else {
      result = await agentRepo.findAllPaginated(pageNum, limitNum);
    }

    res.json({
      success: true,
      data: {
        agents: result.agents,
        total: result.total,
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
});

agentsRouter.get('/:agentId', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { agentId } = req.params;
    const agentRepo = AppDataSource.getCustomRepository(AgentRepository);
    const agent = await agentRepo.findById(agentId);

    if (!agent) {
      throw new Error('Agent not found') as ApiError;
    }

    res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    next(error);
  }
});

agentsRouter.post('/', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { name, description, category, capabilities, pricingModel, basePrice } = req.body;

    if (!name || !req.userId) {
      throw new Error('Name and user required') as ApiError;
    }

    const agentRepository = AppDataSource.getRepository(Agent);
    const agent = agentRepository.create({
      developerId: req.userId,
      name,
      description,
      category: category || AgentCategory.EXECUTION,
      capabilities: capabilities || [],
      pricingModel: pricingModel || PricingModel.PER_TASK,
      basePrice: basePrice || 0,
      isActive: true,
    });

    await agentRepository.save(agent);

    res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    next(error);
  }
});

agentsRouter.patch('/:agentId', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { agentId } = req.params;
    const { name, description, category, capabilities, pricingModel, basePrice, isActive } = req.body;

    const agentRepo = AppDataSource.getCustomRepository(AgentRepository);
    const agent = await agentRepo.findById(agentId);

    if (!agent) {
      throw new Error('Agent not found') as ApiError;
    }

    if (agent.developerId !== req.userId) {
      throw new Error('Not authorized to update this agent') as ApiError;
    }

    const agentRepository = AppDataSource.getRepository(Agent);
    if (name) agent.name = name;
    if (description !== undefined) agent.description = description;
    if (category) agent.category = category;
    if (capabilities) agent.capabilities = capabilities;
    if (pricingModel) agent.pricingModel = pricingModel;
    if (basePrice !== undefined) agent.basePrice = basePrice;
    if (isActive !== undefined) agent.isActive = isActive;

    await agentRepository.save(agent);

    res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    next(error);
  }
});

agentsRouter.delete('/:agentId', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { agentId } = req.params;

    const agentRepo = AppDataSource.getCustomRepository(AgentRepository);
    const agent = await agentRepo.findById(agentId);

    if (!agent) {
      throw new Error('Agent not found') as ApiError;
    }

    if (agent.developerId !== req.userId) {
      throw new Error('Not authorized to delete this agent') as ApiError;
    }

    const agentRepository = AppDataSource.getRepository(Agent);
    agent.isActive = false;
    await agentRepository.save(agent);

    res.json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

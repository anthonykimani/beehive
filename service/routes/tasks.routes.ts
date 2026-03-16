import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../configs/orm.config';
import { Task, TaskStatus } from '../models/task.entity';
import { TaskRepository } from '../repositories/task.repo';
import { ApiError } from '../middleware/error-handler';

export const tasksRouter = Router();

tasksRouter.get('/', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const taskRepo = AppDataSource.getCustomRepository(TaskRepository);
    const result = await taskRepo.findByUser(req.userId!, pageNum, limitNum);

    res.json({
      success: true,
      data: { tasks: result.tasks, total: result.total },
    });
  } catch (error) {
    next(error);
  }
});

tasksRouter.get('/:taskId', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { taskId } = req.params;
    const taskRepo = AppDataSource.getCustomRepository(TaskRepository);
    const task = await taskRepo.findById(taskId);

    if (!task) {
      throw new Error('Task not found') as ApiError;
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

tasksRouter.post('/', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { description, parameters, swarmId } = req.body;

    if (!req.userId) {
      throw new Error('User required') as ApiError;
    }

    if (!description) {
      throw new Error('Task description required') as ApiError;
    }

    const taskRepository = AppDataSource.getRepository(Task);
    const task = taskRepository.create({
      userId: req.userId,
      description,
      parameters: parameters || {},
      swarmId,
      status: TaskStatus.PENDING,
    });

    await taskRepository.save(task);

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

tasksRouter.post('/:taskId/cancel', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { taskId } = req.params;

    const taskRepo = AppDataSource.getCustomRepository(TaskRepository);
    const task = await taskRepo.findById(taskId);

    if (!task) {
      throw new Error('Task not found') as ApiError;
    }

    if (task.userId !== req.userId) {
      throw new Error('Not authorized to cancel this task') as ApiError;
    }

    const taskRepository = AppDataSource.getRepository(Task);
    task.status = TaskStatus.CANCELLED;
    await taskRepository.save(task);

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

tasksRouter.post('/:taskId/dispute', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { taskId } = req.params;
    const { reason } = req.body;

    const taskRepo = AppDataSource.getCustomRepository(TaskRepository);
    const task = await taskRepo.findById(taskId);

    if (!task) {
      throw new Error('Task not found') as ApiError;
    }

    if (task.userId !== req.userId) {
      throw new Error('Not authorized to dispute this task') as ApiError;
    }

    const taskRepository = AppDataSource.getRepository(Task);
    task.status = TaskStatus.DISPUTED;
    await taskRepository.save(task);

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

tasksRouter.get('/:taskId/steps', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { taskId } = req.params;
    const taskRepo = AppDataSource.getCustomRepository(TaskRepository);
    const task = await taskRepo.findById(taskId);

    if (!task) {
      throw new Error('Task not found') as ApiError;
    }

    res.json({ success: true, data: { steps: task.steps || [] } });
  } catch (error) {
    next(error);
  }
});

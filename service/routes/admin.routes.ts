import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../configs/orm.config';
import { User } from '../models/user.entity';
import { Agent } from '../models/agent.entity';
import { Task, TaskStatus } from '../models/task.entity';
import { Payment } from '../models/payment.entity';
import { ApiError } from '../middleware/error-handler';

export const adminRouter = Router();

adminRouter.get('/stats', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: req.userId },
    });

    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required') as ApiError;
    }

    const [
      totalUsers,
      totalAgents,
      totalTasks,
      totalPayments,
      recentTasks,
      recentAgents,
    ] = await Promise.all([
      AppDataSource.getRepository(User).count(),
      AppDataSource.getRepository(Agent).count(),
      AppDataSource.getRepository(Task).count(),
      AppDataSource.getRepository(Payment).count(),
      AppDataSource.getRepository(Task).find({
        order: { createdAt: 'DESC' },
        take: 10,
      }),
      AppDataSource.getRepository(Agent).find({
        order: { createdAt: 'DESC' },
        take: 10,
      }),
    ]);

    const paymentStats = await AppDataSource.getRepository(Payment)
      .createQueryBuilder('payment')
      .select('SUM(payment.usdAmount)', 'total')
      .addSelect('COUNT(payment.id)', 'count')
      .getRawOne();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAgents,
        totalTasks,
        totalPayments,
        totalVolume: paymentStats?.total || 0,
        recentTasks,
        recentAgents,
      },
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/agents', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: req.userId },
    });

    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required') as ApiError;
    }

    const { verified, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const query = AppDataSource.getRepository(Agent).createQueryBuilder('agent');

    if (verified !== undefined) {
      query.where('agent.isVerified = :verified', { verified: verified === 'true' });
    }

    const [agents, total] = await query
      .orderBy('agent.createdAt', 'DESC')
      .skip((pageNum - 1) * limitNum)
      .take(limitNum)
      .getManyAndCount();

    res.json({
      success: true,
      data: { agents, total, page: pageNum, limit: limitNum },
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/agents/:agentId/verify', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { agentId } = req.params;
    const { verified } = req.body;

    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: req.userId },
    });

    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required') as ApiError;
    }

    const agentRepo = AppDataSource.getRepository(Agent);
    const agent = await agentRepo.findOne({ where: { id: agentId } });

    if (!agent) {
      throw new Error('Agent not found') as ApiError;
    }

    agent.isVerified = verified;
    await agentRepo.save(agent);

    res.json({ success: true, data: agent });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/agents/:agentId/deactivate', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { agentId } = req.params;

    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: req.userId },
    });

    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required') as ApiError;
    }

    const agentRepo = AppDataSource.getRepository(Agent);
    const agent = await agentRepo.findOne({ where: { id: agentId } });

    if (!agent) {
      throw new Error('Agent not found') as ApiError;
    }

    agent.isActive = false;
    await agentRepo.save(agent);

    res.json({ success: true, data: agent });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/tasks', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: req.userId },
    });

    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required') as ApiError;
    }

    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const query = AppDataSource.getRepository(Task).createQueryBuilder('task');

    if (status) {
      query.where('task.status = :status', { status });
    }

    const [tasks, total] = await query
      .orderBy('task.createdAt', 'DESC')
      .skip((pageNum - 1) * limitNum)
      .take(limitNum)
      .getManyAndCount();

    res.json({
      success: true,
      data: { tasks, total, page: pageNum, limit: limitNum },
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/tasks/:taskId/cancel', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { taskId } = req.params;

    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: req.userId },
    });

    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required') as ApiError;
    }

    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOne({ where: { id: taskId } });

    if (!task) {
      throw new Error('Task not found') as ApiError;
    }

    task.status = TaskStatus.CANCELLED;
    await taskRepo.save(task);

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/users', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: req.userId },
    });

    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required') as ApiError;
    }

    const { role, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const query = AppDataSource.getRepository(User).createQueryBuilder('user');

    if (role) {
      query.where('user.role = :role', { role });
    }

    const [users, total] = await query
      .orderBy('user.createdAt', 'DESC')
      .skip((pageNum - 1) * limitNum)
      .take(limitNum)
      .getManyAndCount();

    res.json({
      success: true,
      data: { users, total, page: pageNum, limit: limitNum },
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/users/:userId/role', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const adminUser = await AppDataSource.getRepository(User).findOne({
      where: { id: req.userId },
    });

    if (!adminUser || adminUser.role !== 'admin') {
      throw new Error('Admin access required') as ApiError;
    }

    const userRepo = AppDataSource.getRepository(User);
    const targetUser = await userRepo.findOne({ where: { id: userId } });

    if (!targetUser) {
      throw new Error('User not found') as ApiError;
    }

    targetUser.role = role;
    await userRepo.save(targetUser);

    res.json({ success: true, data: targetUser });
  } catch (error) {
    next(error);
  }
});

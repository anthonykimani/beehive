import { Router, Response } from 'express';
import { AppDataSource } from '../configs/orm.config';
import { User } from '../models/user.entity';
import { Agent } from '../models/agent.entity';
import { Task } from '../models/task.entity';
import { Payment } from '../models/payment.entity';
import { logger } from '../utils/logger';

export const analyticsRouter = Router();

analyticsRouter.get('/metrics', async (req, res: Response, next) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const agentRepo = AppDataSource.getRepository(Agent);
    const taskRepo = AppDataSource.getRepository(Task);
    const paymentRepo = AppDataSource.getRepository(Payment);

    const [
      totalUsers,
      totalAgents,
      totalTasks,
      totalCompletedTasks,
      totalPayments,
      totalVolume,
    ] = await Promise.all([
      userRepo.count(),
      agentRepo.count(),
      taskRepo.count(),
      taskRepo.count({ where: { status: 'COMPLETED' } }),
      paymentRepo.count(),
      paymentRepo
        .createQueryBuilder('payment')
        .select('SUM(payment.usdAmount)', 'total')
        .getRawOne(),
    ]);

    const metrics = {
      dau: totalUsers,
      totalUsers,
      totalAgents,
      totalTasks,
      tasksCompleted: totalCompletedTasks,
      completionRate: totalTasks > 0 ? (totalCompletedTasks / totalTasks) * 100 : 0,
      totalPayments,
      totalVolume: totalVolume?.total || 0,
    };

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Failed to fetch metrics:', error);
    res.json({
      success: true,
      data: {
        dau: 0,
        totalUsers: 0,
        totalAgents: 0,
        totalTasks: 0,
        tasksCompleted: 0,
        completionRate: 0,
        totalPayments: 0,
        totalVolume: 0,
      },
    });
  }
});

analyticsRouter.get('/funnel', async (req, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const agentRepo = AppDataSource.getRepository(Agent);
    const taskRepo = AppDataSource.getRepository(Task);
    const paymentRepo = AppDataSource.getRepository(Payment);

    const [
      usersWithAgents,
      usersWithTasks,
      usersWithPayments,
    ] = await Promise.all([
      agentRepo.createQueryBuilder('agent')
        .select('COUNT(DISTINCT agent.developerId)', 'count')
        .getRawOne(),
      taskRepo.createQueryBuilder('task')
        .select('COUNT(DISTINCT task.userId)', 'count')
        .getRawOne(),
      paymentRepo.createQueryBuilder('payment')
        .select('COUNT(DISTINCT payment.fromUserId)', 'count')
        .getRawOne(),
    ]);

    res.json({
      success: true,
      data: {
        signup: await userRepo.count(),
        firstAgentView: usersWithAgents?.count || 0,
        firstTask: usersWithTasks?.count || 0,
        firstPayment: usersWithPayments?.count || 0,
      },
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        signup: 0,
        firstAgentView: 0,
        firstTask: 0,
        firstPayment: 0,
      },
    });
  }
});

analyticsRouter.post('/track', async (req, res: Response) => {
  const { event, properties } = req.body;
  
  logger.info(`Analytics event: ${event}`, properties);
  
  res.json({ success: true });
});

import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../configs/orm.config';
import { Review } from '../models/review.entity';
import { Task, TaskStatus } from '../models/task.entity';
import { ApiError } from '../middleware/error-handler';

export const reviewsRouter = Router();

reviewsRouter.post('/', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { taskId, agentId, rating, comment } = req.body;

    if (!taskId || !agentId || !rating) {
      throw new Error('Task ID, agent ID, and rating required') as ApiError;
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5') as ApiError;
    }

    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOne({ where: { id: taskId } });

    if (!task) {
      throw new Error('Task not found') as ApiError;
    }

    if (task.userId !== req.userId) {
      throw new Error('Not authorized to review this task') as ApiError;
    }

    if (task.status !== TaskStatus.COMPLETED) {
      throw new Error('Can only review completed tasks') as ApiError;
    }

    const reviewRepo = AppDataSource.getRepository(Review);
    const existingReview = await reviewRepo.findOne({
      where: { taskId, reviewerId: req.userId },
    });

    if (existingReview) {
      throw new Error('Already reviewed this task') as ApiError;
    }

    const review = reviewRepo.create({
      taskId,
      agentId,
      reviewerId: req.userId!,
      rating,
      comment,
    });

    await reviewRepo.save(review);

    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
});

reviewsRouter.get('/agent/:agentId', async (req, res: Response, next) => {
  try {
    const { agentId } = req.params;
    const { limit = '10', offset = '0' } = req.query;

    const reviewRepo = AppDataSource.getRepository(Review);
    const reviews = await reviewRepo.find({
      where: { agentId },
      order: { createdAt: 'DESC' },
      take: parseInt(limit as string, 10),
      skip: parseInt(offset as string, 10),
    });

    const total = await reviewRepo.count({ where: { agentId } });

    const ratingStats = await reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.agentId = :agentId', { agentId })
      .getRawOne();

    res.json({
      success: true,
      data: {
        reviews,
        total,
        averageRating: ratingStats?.average || 0,
        totalRatings: ratingStats?.count || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

reviewsRouter.get('/task/:taskId', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { taskId } = req.params;

    const reviewRepo = AppDataSource.getRepository(Review);
    const reviews = await reviewRepo.find({
      where: { taskId },
    });

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
});

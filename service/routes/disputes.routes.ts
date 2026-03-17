import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../configs/orm.config';
import { Task, TaskStatus } from '../models/task.entity';
import { ApiError } from '../middleware/error-handler';

export const disputesRouter = Router();

enum DisputeStatus {
  OPEN = 'OPEN',
  EVIDENCE_SUBMITTED = 'EVIDENCE_SUBMITTED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

const disputesStore = new Map<string, {
  id: string;
  taskId: string;
  raiserId: string;
  reason: string;
  evidence: string;
  status: DisputeStatus;
  resolution: string;
  createdAt: Date;
  resolvedAt: Date | null;
}>();

disputesRouter.post('/', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { taskId, reason } = req.body;

    if (!taskId || !reason) {
      throw new Error('Task ID and reason required') as ApiError;
    }

    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOne({ where: { id: taskId } });

    if (!task) {
      throw new Error('Task not found') as ApiError;
    }

    if (task.userId !== req.userId) {
      throw new Error('Not authorized to dispute this task') as ApiError;
    }

    const disputeId = `dispute_${Date.now()}`;
    const dispute = {
      id: disputeId,
      taskId,
      raiserId: req.userId!,
      reason,
      evidence: '',
      status: DisputeStatus.OPEN,
      resolution: '',
      createdAt: new Date(),
      resolvedAt: null,
    };

    disputesStore.set(disputeId, dispute);

    task.status = TaskStatus.DISPUTED;
    await taskRepo.save(task);

    res.json({ success: true, data: dispute });
  } catch (error) {
    next(error);
  }
});

disputesRouter.get('/', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    let disputes = Array.from(disputesStore.values());

    if (status) {
      disputes = disputes.filter(d => d.status === status);
    }

    const total = disputes.length;
    const paginatedDisputes = disputes.slice(
      (pageNum - 1) * limitNum,
      pageNum * limitNum
    );

    res.json({
      success: true,
      data: {
        disputes: paginatedDisputes,
        total,
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
});

disputesRouter.get('/:disputeId', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { disputeId } = req.params;
    const dispute = disputesStore.get(disputeId);

    if (!dispute) {
      throw new Error('Dispute not found') as ApiError;
    }

    res.json({ success: true, data: dispute });
  } catch (error) {
    next(error);
  }
});

disputesRouter.post('/:disputeId/evidence', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { disputeId } = req.params;
    const { evidence } = req.body;

    const dispute = disputesStore.get(disputeId);

    if (!dispute) {
      throw new Error('Dispute not found') as ApiError;
    }

    if (dispute.raiserId !== req.userId) {
      throw new Error('Not authorized') as ApiError;
    }

    dispute.evidence = evidence;
    dispute.status = DisputeStatus.EVIDENCE_SUBMITTED;

    res.json({ success: true, data: dispute });
  } catch (error) {
    next(error);
  }
});

disputesRouter.post('/:disputeId/resolve', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { disputeId } = req.params;
    const { resolution, userWins, refundAmount } = req.body;

    const dispute = disputesStore.get(disputeId);

    if (!dispute) {
      throw new Error('Dispute not found') as ApiError;
    }

    dispute.resolution = resolution;
    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolvedAt = new Date();

    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOne({ where: { id: dispute.taskId } });

    if (task) {
      if (userWins) {
        task.status = TaskStatus.CANCELLED;
      } else {
        task.status = TaskStatus.COMPLETED;
      }
      await taskRepo.save(task);
    }

    res.json({ success: true, data: dispute });
  } catch (error) {
    next(error);
  }
});

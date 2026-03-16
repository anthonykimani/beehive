import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../configs/orm.config';
import { Payment, PaymentType, PaymentStatus } from '../models/payment.entity';
import { Task, TaskStatus, EscrowStatus } from '../models/task.entity';
import { ApiError } from '../middleware/error-handler';

export const paymentsRouter = Router();

const PLATFORM_FEE_PERCENT = 5;

paymentsRouter.post('/escrow/lock', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { taskId, amount, currency = 'cUSD' } = req.body;

    if (!taskId || !amount || !req.userId) {
      throw new Error('Task ID and amount required') as ApiError;
    }

    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOne({ where: { id: taskId } });

    if (!task) {
      throw new Error('Task not found') as ApiError;
    }

    if (task.userId !== req.userId) {
      throw new Error('Not authorized') as ApiError;
    }

    const paymentRepo = AppDataSource.getRepository(Payment);
    const payment = paymentRepo.create({
      taskId,
      fromUserId: req.userId,
      type: PaymentType.TASK_PAYMENT,
      status: PaymentStatus.CONFIRMED,
      assetSymbol: currency,
      assetAmount: amount,
      usdAmount: amount,
      reference: `escrow_${taskId}`,
      metadata: { escrowStatus: EscrowStatus.LOCKED },
    });

    await paymentRepo.save(payment);

    task.escrowAmount = amount;
    task.escrowCurrency = currency;
    task.escrowStatus = EscrowStatus.LOCKED;
    await taskRepo.save(task);

    res.json({ success: true, data: { escrowId: payment.id, amount } });
  } catch (error) {
    next(error);
  }
});

paymentsRouter.post('/escrow/release', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { taskId, agentPayments } = req.body;

    if (!taskId || !req.userId) {
      throw new Error('Task ID required') as ApiError;
    }

    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOne({ where: { id: taskId } });

    if (!task) {
      throw new Error('Task not found') as ApiError;
    }

    if (task.userId !== req.userId) {
      throw new Error('Not authorized') as ApiError;
    }

    const totalAmount = parseFloat(task.escrowAmount.toString());
    const platformFee = totalAmount * (PLATFORM_FEE_PERCENT / 100);
    const agentTotal = totalAmount - platformFee;

    const paymentRepo = AppDataSource.getRepository(Payment);
    
    if (agentPayments && Array.isArray(agentPayments)) {
      for (const agentPayment of agentPayments) {
        const payment = paymentRepo.create({
          taskId,
          fromUserId: req.userId,
          toAgentId: agentPayment.agentId,
          type: PaymentType.TASK_PAYMENT,
          status: PaymentStatus.CONFIRMED,
          assetSymbol: task.escrowCurrency,
          assetAmount: agentPayment.amount,
          usdAmount: agentPayment.amount,
          reference: `release_${taskId}_${agentPayment.agentId}`,
        });
        await paymentRepo.save(payment);
      }
    }

    const platformPayment = paymentRepo.create({
      taskId,
      fromUserId: req.userId,
      type: PaymentType.PLATFORM_FEE,
      status: PaymentStatus.CONFIRMED,
      assetSymbol: task.escrowCurrency,
      assetAmount: platformFee,
      usdAmount: platformFee,
      reference: `platform_fee_${taskId}`,
    });
    await paymentRepo.save(platformPayment);

    task.escrowStatus = EscrowStatus.RELEASED;
    task.status = TaskStatus.COMPLETED;
    await taskRepo.save(task);

    res.json({ success: true, data: { released: true, platformFee } });
  } catch (error) {
    next(error);
  }
});

paymentsRouter.post('/escrow/refund', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const { taskId } = req.body;

    if (!taskId || !req.userId) {
      throw new Error('Task ID required') as ApiError;
    }

    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOne({ where: { id: taskId } });

    if (!task) {
      throw new Error('Task not found') as ApiError;
    }

    if (task.userId !== req.userId) {
      throw new Error('Not authorized') as ApiError;
    }

    const paymentRepo = AppDataSource.getRepository(Payment);
    const refund = paymentRepo.create({
      taskId,
      fromUserId: req.userId,
      type: PaymentType.REFUND,
      status: PaymentStatus.CONFIRMED,
      assetSymbol: task.escrowCurrency,
      assetAmount: task.escrowAmount,
      usdAmount: task.escrowAmount,
      reference: `refund_${taskId}`,
    });
    await paymentRepo.save(refund);

    task.escrowStatus = EscrowStatus.REFUNDED;
    await taskRepo.save(task);

    res.json({ success: true, data: { refunded: true } });
  } catch (error) {
    next(error);
  }
});

paymentsRouter.get('/history', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const paymentRepo = AppDataSource.getRepository(Payment);
    const payments = await paymentRepo.find({
      where: { fromUserId: req.userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    res.json({ success: true, data: { payments, total: payments.length } });
  } catch (error) {
    next(error);
  }
});

import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../../configs/env.config';
import { logger } from '../../utils/logger';

export function setupSocketHandlers(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, env.jwt.secret) as any;
      socket.data.userId = decoded.userId;
      socket.data.walletAddress = decoded.walletAddress;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    logger.info({ message: 'Client connected', userId, socketId: socket.id });

    socket.join(`user:${userId}`);

    socket.on('join-task', (taskId: string) => {
      socket.join(`task:${taskId}`);
      logger.info({ message: 'Joined task room', userId, taskId });
    });

    socket.on('leave-task', (taskId: string) => {
      socket.leave(`task:${taskId}`);
      logger.info({ message: 'Left task room', userId, taskId });
    });

    socket.on('disconnect', () => {
      logger.info({ message: 'Client disconnected', userId, socketId: socket.id });
    });
  });
}

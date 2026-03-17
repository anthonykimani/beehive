import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from 'dotenv';
import { AppDataSource } from './configs/orm.config';
import { corsConfig } from './configs/cors.config';
import { errorHandler } from './middleware/error-handler';
import { healthRouter } from './routes/health.routes';
import { authRouter } from './routes/auth.routes';
import { agentsRouter } from './routes/agents.routes';
import { swarmsRouter } from './routes/swarms.routes';
import { tasksRouter } from './routes/tasks.routes';
import { paymentsRouter } from './routes/payments.routes';
import { setupSocketHandlers } from './utils/socket/setup';
import { logger } from './utils/logger';

config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsConfig,
});

const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/agents', agentsRouter);
app.use('/api/v1/swarms', swarmsRouter);
app.use('/api/v1/tasks', tasksRouter);
app.use('/api/v1/payments', paymentsRouter);

app.get('/', (req, res) => {
  res.json({
    service: 'SwarmFund API',
    version: '1.0.0',
    status: 'running',
  });
});

app.use(errorHandler);

export { app, httpServer, io };

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.warn('Database connection failed, running without DB:', error);
  }

  setupSocketHandlers(io);

  httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

bootstrap();

import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../models/task.entity';

export class TaskRepository extends Repository<Task> {
  async findByUser(userId: string, page: number = 1, limit: number = 20): Promise<{ tasks: Task[]; total: number }> {
    const [tasks, total] = await this.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { tasks, total };
  }

  async findById(taskId: string): Promise<Task | null> {
    return this.findOne({ where: { id: taskId } });
  }

  async findBySwarm(swarmId: string): Promise<Task[]> {
    return this.find({ where: { swarmId } });
  }

  async findActiveByUser(userId: string): Promise<Task[]> {
    return this.find({
      where: { userId, status: TaskStatus.IN_PROGRESS },
    });
  }
}

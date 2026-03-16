import { Repository } from 'typeorm';
import { Swarm } from '../models/swarm.entity';

export class SwarmRepository extends Repository<Swarm> {
  async findAllPublic(page: number = 1, limit: number = 20): Promise<{ swarms: Swarm[]; total: number }> {
    const [swarms, total] = await this.findAndCount({
      where: { isPublic: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { swarms, total };
  }

  async findById(swarmId: string): Promise<Swarm | null> {
    return this.findOne({ where: { id: swarmId } });
  }

  async findByCreator(creatorId: string): Promise<Swarm[]> {
    return this.find({ where: { creatorId } });
  }

  async findByAgent(agentId: string): Promise<Swarm[]> {
    return this.createQueryBuilder('swarm')
      .where('swarm.agents::text LIKE :agentId', { agentId: `%${agentId}%` })
      .getMany();
  }
}

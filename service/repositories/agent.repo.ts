import { Repository } from 'typeorm';
import { Agent, AgentCategory } from '../models/agent.entity';

export class AgentRepository extends Repository<Agent> {
  async findAllPaginated(page: number = 1, limit: number = 20): Promise<{ agents: Agent[]; total: number }> {
    const [agents, total] = await this.findAndCount({
      where: { isActive: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { agents, total };
  }

  async findByCategory(category: AgentCategory, page: number = 1, limit: number = 20): Promise<{ agents: Agent[]; total: number }> {
    const [agents, total] = await this.findAndCount({
      where: { category, isActive: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { averageRating: 'DESC' },
    });
    return { agents, total };
  }

  async findById(agentId: string): Promise<Agent | null> {
    return this.findOne({ where: { id: agentId } });
  }

  async findByDeveloper(developerId: string): Promise<Agent[]> {
    return this.find({ where: { developerId } });
  }

  async search(query: string, page: number = 1, limit: number = 20): Promise<{ agents: Agent[]; total: number }> {
    const [agents, total] = await this.createQueryBuilder('agent')
      .where('agent.isActive = :isActive', { isActive: true })
      .andWhere(
        '(agent.name ILIKE :query OR agent.description ILIKE :query)',
        { query: `%${query}%` }
      )
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('agent.averageRating', 'DESC')
      .getManyAndCount();
    return { agents, total };
  }
}

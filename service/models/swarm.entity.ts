import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

interface SwarmAgent {
  agentId: string;
  role: string;
  order: number;
}

@Entity('swarms')
export class Swarm {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  creatorId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator!: User;

  @Column({ nullable: true })
  name?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: false })
  isPublic!: boolean;

  @Column({ type: 'jsonb', default: [] })
  agents!: SwarmAgent[];

  @Column({ default: 0 })
  totalTasksCompleted!: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

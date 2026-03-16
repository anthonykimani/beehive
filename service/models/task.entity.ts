import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Swarm } from './swarm.entity';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

export enum EscrowStatus {
  LOCKED = 'locked',
  RELEASING = 'releasing',
  RELEASED = 'released',
  REFUNDED = 'refunded',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ nullable: true })
  swarmId?: string;

  @ManyToOne(() => Swarm, { nullable: true })
  @JoinColumn({ name: 'swarmId' })
  swarm?: Swarm;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'jsonb', default: {} })
  parameters!: Record<string, any>;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status!: TaskStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  escrowAmount!: number;

  @Column({ default: 'cUSD' })
  escrowCurrency!: string;

  @Column({ type: 'enum', enum: EscrowStatus, default: EscrowStatus.LOCKED })
  escrowStatus!: EscrowStatus;

  @Column({ nullable: true })
  startedAt?: Date;

  @Column({ nullable: true })
  completedAt?: Date;

  @Column({ type: 'jsonb', default: [] })
  steps!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum AgentCategory {
  DISCOVERY = 'discovery',
  ANALYSIS = 'analysis',
  EXECUTION = 'execution',
  COORDINATION = 'coordination',
}

export enum PricingModel {
  PER_TASK = 'perTask',
  PER_HOUR = 'perHour',
  SUBSCRIPTION = 'subscription',
}

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  developerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'developerId' })
  developer!: User;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: AgentCategory, default: AgentCategory.EXECUTION })
  category!: AgentCategory;

  @Column({ type: 'jsonb', default: [] })
  capabilities!: string[];

  @Column({ type: 'enum', enum: PricingModel, default: PricingModel.PER_TASK })
  pricingModel!: PricingModel;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  basePrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  stakeAmount!: number;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  totalTasksCompleted!: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

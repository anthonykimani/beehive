import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum PaymentType {
  TASK_PAYMENT = 'task_payment',
  REFUND = 'refund',
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  PLATFORM_FEE = 'platform_fee',
}

export enum PaymentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  taskId?: string;

  @Column()
  fromUserId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'fromUserId' })
  fromUser!: User;

  @Column({ nullable: true })
  toAgentId?: string;

  @Column({ type: 'enum', enum: PaymentType })
  type!: PaymentType;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ default: 'cUSD' })
  assetSymbol!: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  assetAmount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  usdAmount!: number;

  @Column({ nullable: true })
  txHash?: string;

  @Column({ nullable: true })
  reference?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  confirmedAt?: Date;
}

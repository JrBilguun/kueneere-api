import {
  ObjectType,
  ID,
  Int,
  Float,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import { FilterableField } from '@ptc-org/nestjs-query-graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  REFUNDED = 'refunded',
}
registerEnumType(PaymentStatus, { name: 'PaymentStatus' });

@ObjectType('Payment')
@Entity('payments')
export class Payment {
  @FilterableField(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @FilterableField(() => Int)
  @Column({ name: 'source_id' })
  @Index()
  sourceId: number;

  @FilterableField()
  @Column({ name: 'source_type', length: 50, default: 'order' })
  sourceType: string;

  @FilterableField()
  @Column({ length: 30, default: 'qpay' })
  provider: string;

  @FilterableField(() => Float)
  @Column('decimal', {
    precision: 12,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
  })
  amount: number;

  @FilterableField({ nullable: true })
  @Column({ name: 'transaction_id', length: 255, nullable: true })
  @Index()
  transactionId: string | null;

  @FilterableField(() => PaymentStatus)
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @FilterableField({ nullable: true })
  @Column({ name: 'paid_at', type: 'datetime', nullable: true })
  paidAt: Date | null;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'json', nullable: true })
  data: Record<string, unknown> | null;

  @FilterableField()
  @CreateDateColumn()
  createdAt: Date;

  @FilterableField()
  @UpdateDateColumn()
  updatedAt: Date;
}

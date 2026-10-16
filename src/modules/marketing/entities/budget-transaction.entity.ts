import { ObjectType, ID, Int, Float } from '@nestjs/graphql';
import { FilterableField } from '@ptc-org/nestjs-query-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

const num = { to: (v: number) => v, from: (v: string) => Number(v) };

/** Төсвийн гүйлгээ: зарлага (сөрөг) / цэнэглэлт (эерэг) */
@ObjectType('BudgetTransaction')
@Entity('budget_transactions')
export class BudgetTransaction {
  @FilterableField(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @FilterableField()
  @Column({ length: 255 })
  description: string;

  @FilterableField(() => Float)
  @Column('decimal', { precision: 14, scale: 2, transformer: num })
  amount: number;

  @FilterableField({ nullable: true })
  @Column({ length: 100, nullable: true })
  channel: string | null;

  @FilterableField(() => Int, { nullable: true })
  @Column({ name: 'campaign_id', nullable: true })
  campaignId: number | null;

  @FilterableField()
  @Column({
    name: 'occurred_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Index()
  occurredAt: Date;

  @FilterableField()
  @CreateDateColumn()
  createdAt: Date;
}

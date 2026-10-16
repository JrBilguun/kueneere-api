import { ObjectType, ID, Float } from '@nestjs/graphql';
import { FilterableField } from '@ptc-org/nestjs-query-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

const num = { to: (v: number) => v, from: (v: string) => Number(v) };

/** Сувгийн төсөв — kueneere-admin "Budget" */
@ObjectType('ChannelBudget')
@Entity('channel_budgets')
export class ChannelBudget {
  @FilterableField(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @FilterableField()
  @Column({ length: 100, unique: true })
  channel: string;

  @FilterableField(() => Float)
  @Column('decimal', { precision: 14, scale: 2, default: 0, transformer: num })
  allocated: number;

  @FilterableField(() => Float)
  @Column('decimal', { precision: 14, scale: 2, default: 0, transformer: num })
  spent: number;

  @FilterableField()
  @UpdateDateColumn()
  updatedAt: Date;
}

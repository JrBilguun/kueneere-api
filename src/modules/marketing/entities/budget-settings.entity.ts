import { ObjectType, Int, Float, Field } from '@nestjs/graphql';
import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

const num = { to: (v: number) => v, from: (v: string) => Number(v) };

/** Нийт / өдрийн төсөв — нэг мөртэй (id = 1) тохиргоо */
@ObjectType('BudgetSettings')
@Entity('budget_settings')
export class BudgetSettings {
  @Field(() => Int)
  @PrimaryColumn({ type: 'int', default: 1 })
  id: number;

  @Field(() => Float)
  @Column('decimal', {
    name: 'total_budget',
    precision: 14,
    scale: 2,
    default: 0,
    transformer: num,
  })
  totalBudget: number;

  @Field(() => Float)
  @Column('decimal', {
    name: 'daily_budget',
    precision: 14,
    scale: 2,
    default: 0,
    transformer: num,
  })
  dailyBudget: number;

  @Field()
  @Column({ length: 10, default: 'MNT' })
  currency: string;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Look } from './look.entity';
import { Product } from '../../catalog/entities/product.entity';

const pct = {
  to: (v: number) => v,
  from: (v: string) => Number(v),
};

/** Лук дээрх нэг цэг: аль бараа, зургийн хаана (x, y — 0..100 %) */
@ObjectType('LookItem')
@Entity('look_items')
export class LookItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column({ name: 'look_id' })
  lookId: number;

  @Field(() => Int)
  @Column({ name: 'product_id' })
  productId: number;

  @Field(() => Float)
  @Column('decimal', { precision: 6, scale: 3, transformer: pct })
  x: number;

  @Field(() => Float)
  @Column('decimal', { precision: 6, scale: 3, transformer: pct })
  y: number;

  @Field(() => Int)
  @Column({ default: 0 })
  position: number;

  @ManyToOne(() => Look, (l) => l.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'look_id' })
  look: Look;

  @Field(() => Product, { nullable: true })
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

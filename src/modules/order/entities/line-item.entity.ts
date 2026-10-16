import { ObjectType, ID, Int, Float, Field } from '@nestjs/graphql';
import { FilterableField } from '@ptc-org/nestjs-query-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Variant } from '../../catalog/entities/variant.entity';
import { Product } from '../../catalog/entities/product.entity';

const money = { to: (v: number) => v, from: (v: string) => Number(v) };

@ObjectType('LineItem')
@Entity('line_items')
export class LineItem {
  @FilterableField(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @FilterableField(() => Int)
  @Column({ name: 'order_id' })
  orderId: number;

  @FilterableField(() => Int, { nullable: true })
  @Column({ name: 'product_id', nullable: true })
  productId: number | null;

  @FilterableField(() => Int, { nullable: true })
  @Column({ name: 'variant_id', nullable: true })
  variantId: number | null;

  /** Захиалгын үеийн нэр/зураг/хэмжээг хадгална (бараа өөрчлөгдсөн ч түүх хэвээр) */
  @Field()
  @Column({ length: 255, default: '' })
  name: string;

  /** "Бүтэн лук"-ээр нэмсэн бол лукийн id (багц хямдралд) */
  @FilterableField(() => Int, { nullable: true })
  @Column({ name: 'look_id', type: 'int', nullable: true })
  lookId: number | null;

  @Field({ nullable: true })
  @Column({ name: 'product_slug', length: 255, nullable: true })
  productSlug: string | null;

  @Field({ nullable: true })
  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl: string | null;

  @Field({ nullable: true })
  @Column({ length: 20, nullable: true })
  size: string | null;

  @Field({ nullable: true })
  @Column({ length: 100, nullable: true })
  color: string | null;

  @FilterableField(() => Int)
  @Column({ default: 1 })
  quantity: number;

  @FilterableField(() => Float)
  @Column('decimal', {
    name: 'unit_price',
    precision: 12,
    scale: 2,
    transformer: money,
  })
  unitPrice: number;

  @FilterableField(() => Float)
  @Column('decimal', { precision: 12, scale: 2, transformer: money })
  amount: number;

  @ManyToOne(() => Order, (o) => o.lineItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Variant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'variant_id' })
  variant: Variant | null;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product | null;
}

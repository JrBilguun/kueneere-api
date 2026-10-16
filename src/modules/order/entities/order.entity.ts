import {
  ObjectType,
  ID,
  Float,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import {
  FilterableField,
  UnPagedRelation,
} from '@ptc-org/nestjs-query-graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { LineItem } from './line-item.entity';

export enum OrderStatus {
  /** Сагс (checkout хийгдээгүй) */
  BASKET = 'basket',
  /** Checkout хийсэн, төлбөр хүлээж буй */
  PENDING = 'pending',
  /** Төлбөр баталгаажсан */
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}
registerEnumType(OrderStatus, { name: 'OrderStatus' });

export enum PaymentState {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
}
registerEnumType(PaymentState, { name: 'PaymentState' });

const money = {
  to: (v: number) => v,
  from: (v: string) => Number(v),
};

@ObjectType('Order')
@UnPagedRelation('lineItems', () => LineItem)
@Entity('orders')
export class Order {
  @FilterableField(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @FilterableField()
  @Column({ length: 50, unique: true })
  number: string;

  @FilterableField({ nullable: true })
  @Column({ name: 'user_id', type: 'varchar', length: 36, nullable: true })
  @Index()
  userId: string | null;

  /** Зочин сагсны түлхүүр — frontend localStorage-д хадгална */
  @Field({ nullable: true })
  @Column({ name: 'cart_token', length: 64, nullable: true, unique: true })
  cartToken: string | null;

  @FilterableField(() => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.BASKET })
  @Index()
  status: OrderStatus;

  @FilterableField(() => PaymentState)
  @Column({
    name: 'payment_state',
    type: 'enum',
    enum: PaymentState,
    default: PaymentState.UNPAID,
  })
  paymentState: PaymentState;

  @FilterableField(() => Float)
  @Column('decimal', {
    name: 'item_total',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: money,
  })
  itemTotal: number;

  /** Лукийн багц хямдрал */
  @FilterableField(() => Float)
  @Column('decimal', {
    name: 'discount_total',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: money,
  })
  discountTotal: number;

  @FilterableField(() => Float)
  @Column('decimal', {
    name: 'delivery_fee',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: money,
  })
  deliveryFee: number;

  @FilterableField(() => Float)
  @Column('decimal', {
    precision: 12,
    scale: 2,
    default: 0,
    transformer: money,
  })
  total: number;

  @FilterableField()
  @Column({ length: 10, default: 'MNT' })
  currency: string;

  // ── Хүлээн авагч ──
  @FilterableField({ nullable: true })
  @Column({ name: 'customer_name', length: 255, nullable: true })
  customerName: string | null;

  @FilterableField({ nullable: true })
  @Column({ length: 255, nullable: true })
  email: string | null;

  @FilterableField({ nullable: true })
  @Column({ length: 30, nullable: true })
  phone: string | null;

  // ── Хүргэлтийн хаяг ──
  @FilterableField({ nullable: true })
  @Column({ length: 100, nullable: true })
  city: string | null;

  @FilterableField({ nullable: true })
  @Column({ length: 100, nullable: true })
  district: string | null;

  @Field({ nullable: true })
  @Column({ length: 100, nullable: true })
  khoroo: string | null;

  @Field({ nullable: true })
  @Column({ name: 'address_line', length: 500, nullable: true })
  addressLine: string | null;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @FilterableField({ nullable: true })
  @Column({ name: 'placed_at', type: 'datetime', nullable: true })
  placedAt: Date | null;

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

  @OneToMany(() => LineItem, (li) => li.order)
  lineItems: LineItem[];
}

import { ObjectType, ID, Int, Float } from '@nestjs/graphql';
import { FilterableField, Relation } from '@ptc-org/nestjs-query-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

/**
 * Барааны хувилбар — хэмжээ (XS..XL) / өнгө тус бүрийн үлдэгдэл.
 * price хоосон бол product.price ашиглагдана.
 */
@ObjectType('Variant')
@Relation('product', () => Product)
@Entity('variants')
@Index(['productId', 'size', 'color'], { unique: true })
export class Variant {
  @FilterableField(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @FilterableField(() => Int)
  @Column({ name: 'product_id' })
  productId: number;

  @FilterableField({ nullable: true })
  @Column({ length: 100, nullable: true, unique: true })
  sku: string | null;

  @FilterableField()
  @Column({ length: 20, default: 'OS' })
  size: string;

  @FilterableField()
  @Column({ length: 100, default: '' })
  color: string;

  @FilterableField(() => Int)
  @Column({ default: 0 })
  stock: number;

  @FilterableField(() => Float, { nullable: true })
  @Column('decimal', {
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: {
      to: (v: number | null) => v,
      from: (v: string | null) => (v == null ? null : Number(v)),
    },
  })
  price: number | null;

  @FilterableField(() => Int)
  @Column({ default: 0 })
  position: number;

  @FilterableField()
  @CreateDateColumn()
  createdAt: Date;

  @FilterableField()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Product, (p) => p.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

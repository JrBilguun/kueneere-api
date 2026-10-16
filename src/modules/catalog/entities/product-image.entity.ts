import { ObjectType, ID, Int, Field } from '@nestjs/graphql';
import { FilterableField, Relation } from '@ptc-org/nestjs-query-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@ObjectType('ProductImage')
@Relation('product', () => Product)
@Entity('product_images')
export class ProductImage {
  @FilterableField(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @FilterableField(() => Int)
  @Column({ name: 'product_id' })
  productId: number;

  @Field()
  @Column({ name: 'image_url', length: 500 })
  imageUrl: string;

  @Field({ nullable: true })
  @Column({ length: 255, nullable: true })
  alt: string | null;

  @FilterableField(() => Int)
  @Column({ default: 0 })
  position: number;

  @ManyToOne(() => Product, (p) => p.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

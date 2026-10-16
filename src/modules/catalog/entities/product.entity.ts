import {
  ObjectType,
  ID,
  Int,
  Float,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import {
  FilterableField,
  Relation,
  UnPagedRelation,
} from '@ptc-org/nestjs-query-graphql';
import { SortDirection } from '@ptc-org/nestjs-query-core';
import GraphQLJSON from 'graphql-type-json';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { Variant } from './variant.entity';
import { ProductImage } from './product-image.entity';

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}
registerEnumType(ProductStatus, { name: 'ProductStatus' });

/**
 * Бараа. kueneree-ийн барааны хуудсанд хэрэгтэй бүх талбар:
 * нэр, үнэ, өнгө, хэмжээ (variant), fit note, details/care/delivery аккордеон,
 * дроп (DROP 01 — FW 26), олон хэлний орчуулга.
 *
 * translations: { en: { name, description, details, care, fitNote, color }, ko: {...} }
 */
@ObjectType('Product')
@Relation('category', () => Category, { nullable: true })
@UnPagedRelation('variants', () => Variant, {
  defaultSort: [{ field: 'position', direction: SortDirection.ASC }],
})
@UnPagedRelation('images', () => ProductImage, {
  defaultSort: [{ field: 'position', direction: SortDirection.ASC }],
})
@Entity('products')
export class Product {
  @FilterableField(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @FilterableField(() => Int, { nullable: true })
  @Column({ name: 'category_id', nullable: true })
  categoryId: number | null;

  @FilterableField()
  @Column({ length: 255 })
  name: string;

  @FilterableField()
  @Column({ length: 255, unique: true })
  slug: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  details: string | null;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  care: string | null;

  @Field({ nullable: true })
  @Column({ name: 'fit_note', length: 500, nullable: true })
  fitNote: string | null;

  @FilterableField({ nullable: true })
  @Column({ length: 100, nullable: true })
  color: string | null;

  @Field({ nullable: true })
  @Column({ name: 'color_hex', length: 20, nullable: true })
  colorHex: string | null;

  @FilterableField(() => Float)
  @Column('decimal', {
    precision: 12,
    scale: 2,
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
  })
  price: number;

  @FilterableField(() => Float, { nullable: true })
  @Column('decimal', {
    name: 'compare_at_price',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: {
      to: (v: number | null) => v,
      from: (v: string | null) => (v == null ? null : Number(v)),
    },
  })
  compareAtPrice: number | null;

  @FilterableField()
  @Column({ length: 10, default: 'MNT' })
  currency: string;

  @Field({ nullable: true })
  @Column({ name: 'main_image', length: 500, nullable: true })
  mainImage: string | null;

  @FilterableField({ nullable: true })
  @Column({ name: 'drop_name', length: 100, nullable: true })
  @Index()
  dropName: string | null;

  @FilterableField(() => ProductStatus)
  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  @Index()
  status: ProductStatus;

  @FilterableField()
  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @FilterableField(() => Int)
  @Column({ default: 0 })
  position: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'json', nullable: true })
  translations: Record<string, Record<string, string>> | null;

  @FilterableField()
  @CreateDateColumn()
  createdAt: Date;

  @FilterableField()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @OneToMany(() => Variant, (v) => v.product)
  variants: Variant[];

  @OneToMany(() => ProductImage, (i) => i.product)
  images: ProductImage[];
}

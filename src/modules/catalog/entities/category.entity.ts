import { ObjectType, ID, Int, Field } from '@nestjs/graphql';
import { FilterableField } from '@ptc-org/nestjs-query-graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Барааны ангилал (HEADWEAR, OUTERWEAR, TOPS, BOTTOMS ...)
 * translations: { en: { name: 'Headwear' }, ko: { name: '모자' } }
 */
@ObjectType('Category')
@Entity('categories')
export class Category {
  @FilterableField(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

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
  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl: string | null;

  @FilterableField(() => Int, { nullable: true })
  @Column({ name: 'parent_id', nullable: true })
  parentId: number | null;

  @FilterableField(() => Int)
  @Column({ default: 0 })
  position: number;

  @FilterableField()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'json', nullable: true })
  translations: Record<string, Record<string, string>> | null;

  @FilterableField()
  @CreateDateColumn()
  createdAt: Date;

  @FilterableField()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, (c) => c.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Category | null;

  @OneToMany(() => Category, (c) => c.parent)
  children: Category[];
}

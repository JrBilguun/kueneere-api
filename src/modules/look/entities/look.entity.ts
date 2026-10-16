import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
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
import { LookItem } from './look-item.entity';

/**
 * Shop the Look — нэг зураг + түүн дээрх цэгүүд (бараа бүрт x/y %).
 * Үнийг бараанаас авна; лук дээр зөвхөн багцын хямдралын хувь хадгална.
 * translations: { en: { title }, ko: { title } }
 */
@ObjectType('Look')
@Entity('looks')
export class Look {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 255 })
  title: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'json', nullable: true })
  translations: Record<string, { title?: string }> | null;

  @Field()
  @Column({ name: 'image_url', length: 500 })
  imageUrl: string;

  /** Зургийн жинхэнэ харьцаа (layout shift-гүй, цэг зөв байрлахад) */
  @Field(() => Int, { nullable: true })
  @Column({ name: 'image_width', type: 'int', nullable: true })
  imageWidth: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: 'image_height', type: 'int', nullable: true })
  imageHeight: number | null;

  /** "Бүтэн лукээр нь авбал −N%" (0 = хямдралгүй) */
  @Field(() => Float)
  @Column('decimal', {
    name: 'bundle_discount_percent',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
  })
  bundleDiscountPercent: number;

  @Field()
  @Column({ name: 'is_published', default: false })
  @Index()
  isPublished: boolean;

  @Field(() => Int)
  @Column({ default: 0 })
  position: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [LookItem])
  @OneToMany(() => LookItem, (i) => i.look, { cascade: true })
  items: LookItem[];
}

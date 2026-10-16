import { ObjectType, ID, Int, Float, Field } from '@nestjs/graphql';
import { FilterableField } from '@ptc-org/nestjs-query-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

const num = { to: (v: number) => v, from: (v: string) => Number(v) };

/** Аудиторийн сегмент — kueneere-admin "Intel" */
@ObjectType('AudienceSegment')
@Entity('audience_segments')
export class AudienceSegment {
  @FilterableField(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @FilterableField()
  @Column({ length: 255 })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @FilterableField(() => Int)
  @Column({ type: 'int', default: 0 })
  size: number;

  /** Өсөлт % (сөрөг байж болно) */
  @FilterableField(() => Float)
  @Column('decimal', { precision: 7, scale: 2, default: 0, transformer: num })
  growth: number;

  /** Engagement % */
  @FilterableField(() => Float)
  @Column('decimal', { precision: 6, scale: 2, default: 0, transformer: num })
  engagement: number;

  /** Lifetime value (₮) */
  @FilterableField(() => Float)
  @Column('decimal', { precision: 14, scale: 2, default: 0, transformer: num })
  ltv: number;

  /** high / medium / low */
  @FilterableField()
  @Column({ name: 'engagement_level', length: 20, default: 'medium' })
  engagementLevel: string;

  @FilterableField()
  @CreateDateColumn()
  createdAt: Date;

  @FilterableField()
  @UpdateDateColumn()
  updatedAt: Date;
}

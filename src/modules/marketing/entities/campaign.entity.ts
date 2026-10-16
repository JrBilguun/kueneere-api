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
  UnPagedRelation,
} from '@ptc-org/nestjs-query-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { CampaignAsset } from './campaign-asset.entity';

export enum CampaignStatus {
  LIVE = 'live',
  PAUSED = 'paused',
  SCHEDULED = 'scheduled',
  ENDED = 'ended',
}
registerEnumType(CampaignStatus, { name: 'CampaignStatus' });

export const money = {
  to: (v: number) => v,
  from: (v: string) => Number(v),
};

/**
 * Маркетингийн кампанит ажил — kueneere-admin "Pulse" / "Architect" (Gantt)
 */
@ObjectType('Campaign')
@UnPagedRelation('assets', () => CampaignAsset)
@Entity('campaigns')
export class Campaign {
  @FilterableField(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @FilterableField()
  @Column({ length: 255 })
  name: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @FilterableField(() => CampaignStatus)
  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.SCHEDULED,
  })
  @Index()
  status: CampaignStatus;

  /** Meta Ads / Google Ads / TikTok Ads / YouTube / Email / Display / Multi-channel */
  @FilterableField()
  @Column({ length: 100 })
  @Index()
  channel: string;

  @FilterableField(() => Float)
  @Column('decimal', {
    precision: 14,
    scale: 2,
    default: 0,
    transformer: money,
  })
  budget: number;

  @FilterableField(() => Float)
  @Column('decimal', {
    precision: 14,
    scale: 2,
    default: 0,
    transformer: money,
  })
  spend: number;

  @FilterableField(() => Float)
  @Column('decimal', {
    precision: 14,
    scale: 2,
    default: 0,
    transformer: money,
  })
  revenue: number;

  @FilterableField(() => Float)
  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
  })
  impressions: number;

  @FilterableField(() => Int)
  @Column({ type: 'int', default: 0 })
  clicks: number;

  @FilterableField(() => Int)
  @Column({ type: 'int', default: 0 })
  conversions: number;

  @FilterableField({ nullable: true })
  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string | null;

  @FilterableField({ nullable: true })
  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string | null;

  @FilterableField()
  @CreateDateColumn()
  createdAt: Date;

  @FilterableField()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CampaignAsset, (a) => a.campaign)
  assets: CampaignAsset[];
}

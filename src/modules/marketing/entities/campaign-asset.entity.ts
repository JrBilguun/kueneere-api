import {
  ObjectType,
  ID,
  Int,
  Float,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import { FilterableField, Relation } from '@ptc-org/nestjs-query-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Campaign } from './campaign.entity';

export enum AssetType {
  IMAGE = 'image',
  VIDEO = 'video',
}
registerEnumType(AssetType, { name: 'AssetType' });

export enum AssetSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}
registerEnumType(AssetSize, { name: 'AssetSize' });

/** Креатив / контент — kueneere-admin "Vault" (asset grid) */
@ObjectType('CampaignAsset')
@Relation('campaign', () => Campaign, { nullable: true })
@Entity('campaign_assets')
export class CampaignAsset {
  @FilterableField(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @FilterableField(() => Int, { nullable: true })
  @Column({ name: 'campaign_id', nullable: true })
  campaignId: number | null;

  @FilterableField()
  @Column({ length: 255 })
  name: string;

  @FilterableField(() => AssetType)
  @Column({ type: 'enum', enum: AssetType, default: AssetType.IMAGE })
  type: AssetType;

  @Field()
  @Column({ length: 500 })
  url: string;

  @Field({ nullable: true })
  @Column({ name: 'thumbnail_url', length: 500, nullable: true })
  thumbnailUrl: string | null;

  /** S3 key (устгах үед хэрэгтэй) */
  @Field({ nullable: true })
  @Column({ name: 'storage_key', length: 500, nullable: true })
  storageKey: string | null;

  @FilterableField(() => AssetSize)
  @Column({ type: 'enum', enum: AssetSize, default: AssetSize.SMALL })
  size: AssetSize;

  @FilterableField(() => Int)
  @Column({ type: 'int', default: 0 })
  impressions: number;

  /** Engagement % */
  @FilterableField(() => Float)
  @Column('decimal', {
    precision: 6,
    scale: 2,
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
  })
  engagement: number;

  /** CTR % */
  @FilterableField(() => Float)
  @Column('decimal', {
    precision: 6,
    scale: 2,
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
  })
  ctr: number;

  @FilterableField()
  @CreateDateColumn()
  createdAt: Date;

  @FilterableField()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Campaign, (c) => c.assets, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign | null;
}

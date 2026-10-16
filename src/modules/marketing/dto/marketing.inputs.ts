import { InputType, Field, Int, Float, PartialType } from '@nestjs/graphql';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { CampaignStatus } from '../entities/campaign.entity';
import { AssetSize, AssetType } from '../entities/campaign-asset.entity';

// ── Campaign ────────────────────────────────────────
@InputType('CreateCampaignInput')
export class CreateCampaignInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => CampaignStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  channel: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  spend?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  revenue?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  impressions?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  clicks?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  conversions?: number;

  @Field({ nullable: true, description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true, description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

@InputType('UpdateCampaignInput')
export class UpdateCampaignInput extends PartialType(CreateCampaignInput) {}

// ── CampaignAsset ───────────────────────────────────
@InputType('CreateCampaignAssetInput')
export class CreateCampaignAssetInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @Field(() => AssetType, { nullable: true })
  @IsOptional()
  @IsEnum(AssetType)
  type?: AssetType;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  url: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  storageKey?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  campaignId?: number;

  @Field(() => AssetSize, { nullable: true })
  @IsOptional()
  @IsEnum(AssetSize)
  size?: AssetSize;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  impressions?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  engagement?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  ctr?: number;
}

@InputType('UpdateCampaignAssetInput')
export class UpdateCampaignAssetInput extends PartialType(
  CreateCampaignAssetInput,
) {}

// ── AudienceSegment ─────────────────────────────────
@InputType('CreateAudienceSegmentInput')
export class CreateAudienceSegmentInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  size?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  growth?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  engagement?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ltv?: number;

  @Field({ nullable: true, description: 'high | medium | low' })
  @IsOptional()
  @IsIn(['high', 'medium', 'low'])
  engagementLevel?: string;
}

@InputType('UpdateAudienceSegmentInput')
export class UpdateAudienceSegmentInput extends PartialType(
  CreateAudienceSegmentInput,
) {}

// ── ChannelBudget ───────────────────────────────────
@InputType('CreateChannelBudgetInput')
export class CreateChannelBudgetInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  channel: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  allocated: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  spent?: number;
}

@InputType('UpdateChannelBudgetInput')
export class UpdateChannelBudgetInput extends PartialType(
  CreateChannelBudgetInput,
) {}

// ── Budget actions ──────────────────────────────────
@InputType()
export class UpdateBudgetSettingsInput {
  @Field(() => Float)
  @IsNumber()
  @Min(0)
  totalBudget: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  dailyBudget: number;
}

@InputType()
export class RecordSpendInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  channel: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  campaignId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

@InputType()
export class TopUpBudgetInput {
  @Field(() => Float)
  @IsNumber()
  @Min(1)
  amount: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

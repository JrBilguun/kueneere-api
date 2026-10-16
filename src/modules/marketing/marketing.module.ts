import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { Campaign } from './entities/campaign.entity';
import { CampaignAsset } from './entities/campaign-asset.entity';
import { AudienceSegment } from './entities/audience-segment.entity';
import {
  BudgetSettings,
  BudgetTransaction,
  ChannelBudget,
} from './entities/budget.entities';
import {
  AudienceSegmentService,
  BudgetTransactionService,
  CampaignAssetService,
  CampaignService,
  ChannelBudgetService,
} from './services/marketing.services';
import { AnalyticsService } from './services/analytics.service';
import {
  AnalyticsResolver,
  AudienceSegmentResolver,
  BudgetTransactionResolver,
  CampaignAssetResolver,
  CampaignResolver,
  ChannelBudgetResolver,
} from './resolvers/marketing.resolvers';
import { noopAuthorizers } from '../../common/auth/noop-authorizers';

const queryEntities = [
  Campaign,
  CampaignAsset,
  AudienceSegment,
  ChannelBudget,
  BudgetTransaction,
];

/**
 * Маркетингийн модуль — kueneere-admin-ий Pulse / Architect / Engine /
 * Vault / Intel / Budget хуудсуудын өгөгдөл.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([...queryEntities, BudgetSettings]),
    NestjsQueryTypeOrmModule.forFeature(queryEntities),
  ],
  providers: [
    ...noopAuthorizers(
      'Campaign',
      'CampaignAsset',
      'AudienceSegment',
      'ChannelBudget',
      'BudgetTransaction',
    ),
    CampaignService,
    CampaignAssetService,
    AudienceSegmentService,
    ChannelBudgetService,
    BudgetTransactionService,
    AnalyticsService,
    CampaignResolver,
    CampaignAssetResolver,
    AudienceSegmentResolver,
    ChannelBudgetResolver,
    BudgetTransactionResolver,
    AnalyticsResolver,
  ],
})
export class MarketingModule {}

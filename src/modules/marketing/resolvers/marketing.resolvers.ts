import {
  Resolver,
  ResolveField,
  Parent,
  Float,
  Int,
  Query,
  Mutation,
  Args,
  ID,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { GqlAuthGuard } from '../../../common/guards/gql-auth.guard';
import { MarketingGuard, StaffGuard } from '../../../common/guards/role.guard';
import { Campaign, CampaignStatus } from '../entities/campaign.entity';
import { CampaignAsset } from '../entities/campaign-asset.entity';
import { AudienceSegment } from '../entities/audience-segment.entity';
import {
  BudgetSettings,
  BudgetTransaction,
  ChannelBudget,
} from '../entities/budget.entities';
import {
  AudienceSegmentService,
  BudgetTransactionService,
  CampaignAssetService,
  CampaignService,
  ChannelBudgetService,
} from '../services/marketing.services';
import { AnalyticsService } from '../services/analytics.service';
import {
  CreateAudienceSegmentInput,
  CreateCampaignAssetInput,
  CreateCampaignInput,
  CreateChannelBudgetInput,
  RecordSpendInput,
  TopUpBudgetInput,
  UpdateAudienceSegmentInput,
  UpdateBudgetSettingsInput,
  UpdateCampaignAssetInput,
  UpdateCampaignInput,
  UpdateChannelBudgetInput,
} from '../dto/marketing.inputs';
import {
  BudgetOverview,
  ChannelPerformance,
  DailyRevenuePoint,
  MarketingMetrics,
  StoreOverview,
} from '../dto/analytics.dto';

/**
 * Маркетингийн CRUD — kueneere-admin
 *   Унших: admin | manager | marketer
 *   Бичих: admin | marketer
 */
const read = { guards: [GqlAuthGuard, StaffGuard], maxResultsSize: 500 };
const write = { guards: [GqlAuthGuard, MarketingGuard] };
const opts = {
  enableTotalCount: true,
  pagingStrategy: PagingStrategies.OFFSET as const,
  read,
  create: write,
  update: write,
  delete: write,
};

@Resolver(() => Campaign)
export class CampaignResolver extends CRUDResolver(Campaign, {
  ...opts,
  CreateDTOClass: CreateCampaignInput,
  UpdateDTOClass: UpdateCampaignInput,
}) {
  constructor(
    readonly service: CampaignService,
    private readonly analytics: AnalyticsService,
  ) {
    super(service);
  }

  /** Хугацааны явц % (Gantt timeline) */
  @ResolveField(() => Int)
  progress(@Parent() c: Campaign): number {
    if (c.status === CampaignStatus.ENDED) return 100;
    if (!c.startDate || !c.endDate) return 0;
    const start = new Date(c.startDate).getTime();
    const end = new Date(c.endDate).getTime();
    if (end <= start) return 0;
    const pct = ((Date.now() - start) / (end - start)) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }

  @ResolveField(() => Float)
  roas(@Parent() c: Campaign): number {
    return c.spend > 0 ? Math.round((c.revenue / c.spend) * 100) / 100 : 0;
  }

  @UseGuards(GqlAuthGuard, MarketingGuard)
  @Mutation(() => Campaign, { description: 'live ↔ paused' })
  toggleCampaignStatus(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<Campaign> {
    return this.analytics.toggleCampaignStatus(Number(id));
  }
}

@Resolver(() => CampaignAsset)
export class CampaignAssetResolver extends CRUDResolver(CampaignAsset, {
  ...opts,
  CreateDTOClass: CreateCampaignAssetInput,
  UpdateDTOClass: UpdateCampaignAssetInput,
}) {
  constructor(readonly service: CampaignAssetService) {
    super(service);
  }
}

@Resolver(() => AudienceSegment)
export class AudienceSegmentResolver extends CRUDResolver(AudienceSegment, {
  ...opts,
  CreateDTOClass: CreateAudienceSegmentInput,
  UpdateDTOClass: UpdateAudienceSegmentInput,
}) {
  constructor(readonly service: AudienceSegmentService) {
    super(service);
  }
}

@Resolver(() => ChannelBudget)
export class ChannelBudgetResolver extends CRUDResolver(ChannelBudget, {
  ...opts,
  CreateDTOClass: CreateChannelBudgetInput,
  UpdateDTOClass: UpdateChannelBudgetInput,
}) {
  constructor(readonly service: ChannelBudgetService) {
    super(service);
  }
}

/** Гүйлгээний түүх — зөвхөн унших (бичих нь recordSpend / topUpBudget-аар) */
@Resolver(() => BudgetTransaction)
export class BudgetTransactionResolver extends CRUDResolver(BudgetTransaction, {
  enableTotalCount: true,
  pagingStrategy: PagingStrategies.OFFSET,
  read,
  create: { disabled: true },
  update: { disabled: true },
  delete: { guards: [GqlAuthGuard, MarketingGuard], many: { disabled: true } },
}) {
  constructor(readonly service: BudgetTransactionService) {
    super(service);
  }
}

/** Dashboard / Analytics / Budget тооцоолол */
@Resolver()
@UseGuards(GqlAuthGuard, StaffGuard)
export class AnalyticsResolver {
  constructor(private readonly analytics: AnalyticsService) {}

  @Query(() => MarketingMetrics, { description: 'Pulse — гол үзүүлэлт' })
  marketingMetrics(): Promise<MarketingMetrics> {
    return this.analytics.marketingMetrics();
  }

  @Query(() => [ChannelPerformance], { description: 'Сувгаар задаргаа' })
  channelPerformance(): Promise<ChannelPerformance[]> {
    return this.analytics.channelPerformance();
  }

  @Query(() => BudgetOverview, { description: 'Төсвийн тойм' })
  budgetOverview(): Promise<BudgetOverview> {
    return this.analytics.budgetOverview();
  }

  @Query(() => StoreOverview, { description: 'Дэлгүүрийн борлуулалт' })
  storeOverview(): Promise<StoreOverview> {
    return this.analytics.storeOverview();
  }

  @Query(() => [DailyRevenuePoint], { description: 'Өдрөөр орлого' })
  dailyRevenue(
    @Args('days', { type: () => Int, defaultValue: 30 }) days: number,
  ): Promise<DailyRevenuePoint[]> {
    return this.analytics.dailyRevenue(Math.min(Math.max(days, 1), 365));
  }

  @UseGuards(MarketingGuard)
  @Mutation(() => BudgetSettings, { description: 'Нийт / өдрийн төсөв' })
  updateBudgetSettings(
    @Args('input') input: UpdateBudgetSettingsInput,
  ): Promise<BudgetSettings> {
    return this.analytics.updateSettings(input);
  }

  @UseGuards(MarketingGuard)
  @Mutation(() => BudgetSettings, { description: 'Төсөв цэнэглэх (Add funds)' })
  topUpBudget(@Args('input') input: TopUpBudgetInput): Promise<BudgetSettings> {
    return this.analytics.topUp(input);
  }

  @UseGuards(MarketingGuard)
  @Mutation(() => ChannelBudget, { description: 'Зарлага бүртгэх' })
  recordSpend(@Args('input') input: RecordSpendInput): Promise<ChannelBudget> {
    return this.analytics.recordSpend(input);
  }
}

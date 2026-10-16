import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import {
  BudgetSettings,
  BudgetTransaction,
  ChannelBudget,
} from '../entities/budget.entities';

/** Dashboard "Pulse" — гол үзүүлэлтүүд */
@ObjectType()
export class MarketingMetrics {
  @Field(() => Float) totalImpressions: number;
  @Field(() => Float) totalClicks: number;
  @Field(() => Float) totalConversions: number;
  @Field(() => Float) totalSpend: number;
  @Field(() => Float) totalRevenue: number;
  /** revenue / spend */
  @Field(() => Float) activeROAS: number;
  /** clicks / impressions * 100 */
  @Field(() => Float) ctr: number;
  /** conversions / clicks * 100 */
  @Field(() => Float) conversionRate: number;
  @Field(() => Int) liveCampaigns: number;
  @Field(() => Int) totalCampaigns: number;
}

/** Analytics "Engine" — сувгаар задаргаа */
@ObjectType()
export class ChannelPerformance {
  @Field() channel: string;
  @Field(() => Float) spend: number;
  @Field(() => Float) revenue: number;
  @Field(() => Float) roas: number;
  @Field(() => Float) impressions: number;
  @Field(() => Float) clicks: number;
  @Field(() => Float) conversions: number;
  @Field(() => Int) campaigns: number;
}

@ObjectType()
export class BudgetOverview {
  @Field(() => BudgetSettings) settings: BudgetSettings;
  @Field(() => Float) totalSpent: number;
  @Field(() => Float) remaining: number;
  @Field(() => Float) utilization: number;
  @Field(() => [ChannelBudget]) channels: ChannelBudget[];
  @Field(() => [BudgetTransaction]) recentTransactions: BudgetTransaction[];
}

/** Дэлгүүрийн борлуулалт (kueneree) */
@ObjectType()
export class StoreOverview {
  @Field(() => Int) totalOrders: number;
  @Field(() => Int) paidOrders: number;
  @Field(() => Int) pendingOrders: number;
  @Field(() => Float) revenue: number;
  @Field(() => Float) averageOrderValue: number;
  @Field(() => Int) ordersToday: number;
  @Field(() => Float) revenueToday: number;
  @Field(() => Int) activeProducts: number;
  @Field(() => Int) lowStockVariants: number;
  @Field(() => Int) customers: number;
  @Field(() => Int) newsletterSubscribers: number;
}

@ObjectType()
export class DailyRevenuePoint {
  @Field() date: string;
  @Field(() => Float) revenue: number;
  @Field(() => Int) orders: number;
}

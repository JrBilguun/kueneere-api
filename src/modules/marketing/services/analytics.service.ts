import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Campaign, CampaignStatus } from '../entities/campaign.entity';
import {
  BudgetSettings,
  BudgetTransaction,
  ChannelBudget,
} from '../entities/budget.entities';
import {
  BudgetOverview,
  ChannelPerformance,
  DailyRevenuePoint,
  MarketingMetrics,
  StoreOverview,
} from '../dto/analytics.dto';
import {
  RecordSpendInput,
  TopUpBudgetInput,
  UpdateBudgetSettingsInput,
} from '../dto/marketing.inputs';

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const ratio = (a: number, b: number, mult = 1) =>
  b > 0 ? round((a / b) * mult) : 0;

/**
 * Admin самбарын тооцоолол — mock өгөгдлийн оронд DB-ээс бодитоор гаргана.
 */
@Injectable()
export class AnalyticsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(ChannelBudget)
    private readonly channelRepo: Repository<ChannelBudget>,
    @InjectRepository(BudgetSettings)
    private readonly settingsRepo: Repository<BudgetSettings>,
    @InjectRepository(BudgetTransaction)
    private readonly txRepo: Repository<BudgetTransaction>,
  ) {}

  // ── Marketing ──────────────────────────────────────
  async marketingMetrics(): Promise<MarketingMetrics> {
    const r = await this.campaignRepo
      .createQueryBuilder('c')
      .select('COALESCE(SUM(c.impressions),0)', 'impressions')
      .addSelect('COALESCE(SUM(c.clicks),0)', 'clicks')
      .addSelect('COALESCE(SUM(c.conversions),0)', 'conversions')
      .addSelect('COALESCE(SUM(c.spend),0)', 'spend')
      .addSelect('COALESCE(SUM(c.revenue),0)', 'revenue')
      .addSelect(`SUM(CASE WHEN c.status = 'live' THEN 1 ELSE 0 END)`, 'live')
      .addSelect('COUNT(*)', 'total')
      .getRawOne();
    const impressions = Number(r.impressions);
    const clicks = Number(r.clicks);
    const conversions = Number(r.conversions);
    const spend = Number(r.spend);
    const revenue = Number(r.revenue);
    return {
      totalImpressions: impressions,
      totalClicks: clicks,
      totalConversions: conversions,
      totalSpend: spend,
      totalRevenue: revenue,
      activeROAS: ratio(revenue, spend),
      ctr: ratio(clicks, impressions, 100),
      conversionRate: ratio(conversions, clicks, 100),
      liveCampaigns: Number(r.live ?? 0),
      totalCampaigns: Number(r.total ?? 0),
    };
  }

  async channelPerformance(): Promise<ChannelPerformance[]> {
    const rows = await this.campaignRepo
      .createQueryBuilder('c')
      .select('c.channel', 'channel')
      .addSelect('SUM(c.spend)', 'spend')
      .addSelect('SUM(c.revenue)', 'revenue')
      .addSelect('SUM(c.impressions)', 'impressions')
      .addSelect('SUM(c.clicks)', 'clicks')
      .addSelect('SUM(c.conversions)', 'conversions')
      .addSelect('COUNT(*)', 'campaigns')
      .groupBy('c.channel')
      .orderBy('spend', 'DESC')
      .getRawMany();
    return rows.map((r) => ({
      channel: r.channel,
      spend: Number(r.spend),
      revenue: Number(r.revenue),
      roas: ratio(Number(r.revenue), Number(r.spend)),
      impressions: Number(r.impressions),
      clicks: Number(r.clicks),
      conversions: Number(r.conversions),
      campaigns: Number(r.campaigns),
    }));
  }

  async toggleCampaignStatus(id: number): Promise<Campaign> {
    const c = await this.campaignRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Кампанит ажил олдсонгүй');
    if (c.status === CampaignStatus.LIVE) c.status = CampaignStatus.PAUSED;
    else if (c.status === CampaignStatus.PAUSED) c.status = CampaignStatus.LIVE;
    else throw new BadRequestException('Зөвхөн live/paused төлөвийг солино');
    return this.campaignRepo.save(c);
  }

  // ── Budget ─────────────────────────────────────────
  async getSettings(): Promise<BudgetSettings> {
    let s = await this.settingsRepo.findOne({ where: { id: 1 } });
    if (!s) {
      s = await this.settingsRepo.save(
        this.settingsRepo.create({ id: 1, totalBudget: 0, dailyBudget: 0 }),
      );
    }
    return s;
  }

  async budgetOverview(): Promise<BudgetOverview> {
    const [settings, channels, recentTransactions] = await Promise.all([
      this.getSettings(),
      this.channelRepo.find({ order: { allocated: 'DESC' } }),
      this.txRepo.find({ order: { occurredAt: 'DESC', id: 'DESC' }, take: 20 }),
    ]);
    const totalSpent = channels.reduce((s, c) => s + Number(c.spent), 0);
    return {
      settings,
      totalSpent,
      remaining: Math.max(0, Number(settings.totalBudget) - totalSpent),
      utilization: ratio(totalSpent, Number(settings.totalBudget), 100),
      channels,
      recentTransactions,
    };
  }

  async updateSettings(
    input: UpdateBudgetSettingsInput,
  ): Promise<BudgetSettings> {
    const s = await this.getSettings();
    s.totalBudget = input.totalBudget;
    s.dailyBudget = input.dailyBudget;
    return this.settingsRepo.save(s);
  }

  async topUp(input: TopUpBudgetInput): Promise<BudgetSettings> {
    return this.dataSource.transaction(async (em) => {
      const s = await this.getSettings();
      s.totalBudget = Number(s.totalBudget) + input.amount;
      await em.save(s);
      await em.save(
        em.create(BudgetTransaction, {
          description: input.description ?? 'Budget Top-up',
          amount: input.amount,
          occurredAt: new Date(),
        }),
      );
      return s;
    });
  }

  /** Зарлага бүртгэх: сувгийн spent, кампанит ажлын spend, гүйлгээ */
  async recordSpend(input: RecordSpendInput): Promise<ChannelBudget> {
    return this.dataSource.transaction(async (em) => {
      let channel = await em.findOne(ChannelBudget, {
        where: { channel: input.channel },
      });
      if (!channel) {
        channel = em.create(ChannelBudget, {
          channel: input.channel,
          allocated: 0,
          spent: 0,
        });
      }
      channel.spent = Number(channel.spent) + input.amount;
      await em.save(channel);

      let description = input.description;
      if (input.campaignId) {
        const campaign = await em.findOne(Campaign, {
          where: { id: input.campaignId },
        });
        if (!campaign) throw new NotFoundException('Кампанит ажил олдсонгүй');
        campaign.spend = Number(campaign.spend) + input.amount;
        await em.save(campaign);
        description ??= `${input.channel} - ${campaign.name}`;
      }

      await em.save(
        em.create(BudgetTransaction, {
          description: description ?? input.channel,
          amount: -input.amount,
          channel: input.channel,
          campaignId: input.campaignId ?? null,
          occurredAt: new Date(),
        }),
      );
      return channel;
    });
  }

  // ── Store (kueneree) ───────────────────────────────
  async storeOverview(): Promise<StoreOverview> {
    const q = (sql: string): Promise<Record<string, string | null>> =>
      this.dataSource
        .query<Record<string, string | null>[]>(sql)
        .then((rows) => rows[0]);
    const [orders, today, products, lowStock, customers, subs] =
      await Promise.all([
        q(`SELECT
             SUM(status <> 'basket') AS total,
             SUM(payment_state = 'paid') AS paid,
             SUM(status = 'pending') AS pending,
             COALESCE(SUM(CASE WHEN payment_state = 'paid' THEN total END), 0) AS revenue
           FROM orders`),
        q(`SELECT COUNT(*) AS cnt,
             COALESCE(SUM(CASE WHEN payment_state = 'paid' THEN total END), 0) AS revenue
           FROM orders
           WHERE status <> 'basket' AND placed_at >= UTC_DATE()`),
        q(`SELECT COUNT(*) AS cnt FROM products WHERE status = 'active'`),
        q(`SELECT COUNT(*) AS cnt FROM variants WHERE stock <= 3`),
        q(`SELECT COUNT(*) AS cnt FROM users WHERE roles LIKE '%user%'`),
        q(
          `SELECT COUNT(*) AS cnt FROM newsletter_subscribers WHERE is_active = 1`,
        ),
      ]);
    const paid = Number(orders.paid ?? 0);
    const revenue = Number(orders.revenue ?? 0);
    return {
      totalOrders: Number(orders.total ?? 0),
      paidOrders: paid,
      pendingOrders: Number(orders.pending ?? 0),
      revenue,
      averageOrderValue: ratio(revenue, paid),
      ordersToday: Number(today.cnt ?? 0),
      revenueToday: Number(today.revenue ?? 0),
      activeProducts: Number(products.cnt ?? 0),
      lowStockVariants: Number(lowStock.cnt ?? 0),
      customers: Number(customers.cnt ?? 0),
      newsletterSubscribers: Number(subs.cnt ?? 0),
    };
  }

  async dailyRevenue(days: number): Promise<DailyRevenuePoint[]> {
    const rows = await this.dataSource.query(
      `SELECT DATE(paid_at) AS d, SUM(total) AS revenue, COUNT(*) AS orders
       FROM orders
       WHERE payment_state = 'paid' AND paid_at >= UTC_DATE() - INTERVAL ? DAY
       GROUP BY DATE(paid_at) ORDER BY d ASC`,
      [days - 1],
    );
    const byDate = new Map<string, { revenue: number; orders: number }>();
    for (const r of rows) {
      const key = new Date(r.d).toISOString().slice(0, 10);
      byDate.set(key, { revenue: Number(r.revenue), orders: Number(r.orders) });
    }
    const out: DailyRevenuePoint[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i),
      );
      const key = d.toISOString().slice(0, 10);
      out.push({
        date: key,
        ...(byDate.get(key) ?? { revenue: 0, orders: 0 }),
      });
    }
    return out;
  }
}

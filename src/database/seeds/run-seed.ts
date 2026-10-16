import dataSource from '../data-source';
import { hashPassword } from '../../common/utils/password.util';
import { User } from '../../modules/user/entities/user.entity';
import { Category } from '../../modules/catalog/entities/category.entity';
import {
  Product,
  ProductStatus,
} from '../../modules/catalog/entities/product.entity';
import { Variant } from '../../modules/catalog/entities/variant.entity';
import { ProductImage } from '../../modules/catalog/entities/product-image.entity';
import {
  Campaign,
  CampaignStatus,
} from '../../modules/marketing/entities/campaign.entity';
import {
  AssetSize,
  AssetType,
  CampaignAsset,
} from '../../modules/marketing/entities/campaign-asset.entity';
import { AudienceSegment } from '../../modules/marketing/entities/audience-segment.entity';
import {
  BudgetSettings,
  BudgetTransaction,
  ChannelBudget,
} from '../../modules/marketing/entities/budget.entities';
import {
  ASSETS,
  BUDGET,
  CAMPAIGNS,
  CATEGORIES,
  CHANNEL_BUDGETS,
  PRODUCTS,
  SEGMENTS,
  TRANSACTIONS,
  LOOKS,
  SITE_CONTENT,
} from './seed-data';
import { Look } from '../../modules/look/entities/look.entity';
import { LookItem } from '../../modules/look/entities/look-item.entity';
import { SiteContent } from '../../modules/content/entities/site-content.entity';

/**
 * Seed:  npm run seed            (локал, ts-node)
 *        npm run seed:prod       (Docker дотор, dist/)
 *
 *   SEED_DEMO=false  → зөвхөн админ + ангилал (маркетингийн demo өгөгдөлгүй)
 */
async function main() {
  await dataSource.initialize();
  const log = (m: string) => console.log(`  ✓ ${m}`);
  console.log('🌱 Seeding kueneere_db ...');

  // 0) Сайтын контент (байхгүй хэсгийг л нэмнэ — admin-ий засварыг дарахгүй)
  const contentRepo = dataSource.getRepository(SiteContent);
  for (const [key, data] of Object.entries(SITE_CONTENT)) {
    if (!(await contentRepo.findOne({ where: { key } }))) {
      await contentRepo.save({ key, data });
    }
  }
  log('site content');

  // 1) Админ
  const email = (process.env.ADMIN_EMAIL || 'admin@kueneere.mn').toLowerCase();
  const users = dataSource.getRepository(User);
  if (!(await users.findOne({ where: { email } }))) {
    await users.save(
      users.create({
        email,
        passwordHash: await hashPassword(
          process.env.ADMIN_PASSWORD || 'Admin12345',
        ),
        firstName: 'Admin',
        lastName: 'Kueneree',
        roles: ['admin'],
        isActive: true,
      }),
    );
    log(`admin user: ${email}`);
  } else log(`admin user exists: ${email}`);

  // 2) Ангилал
  const catRepo = dataSource.getRepository(Category);
  const cats = new Map<string, Category>();
  for (const c of CATEGORIES) {
    let cat = await catRepo.findOne({ where: { slug: c.slug } });
    if (!cat) {
      cat = await catRepo.save(
        catRepo.create({
          slug: c.slug,
          name: c.name,
          position: c.position,
          translations: { en: { name: c.en }, ko: { name: c.ko } },
        }),
      );
    }
    cats.set(c.slug, cat);
  }
  log(`${cats.size} categories`);

  if (process.env.SEED_DEMO === 'false') {
    await dataSource.destroy();
    console.log('Done (SEED_DEMO=false)');
    return;
  }

  // 3) Бараа + variant + зураг
  const prodRepo = dataSource.getRepository(Product);
  const varRepo = dataSource.getRepository(Variant);
  const imgRepo = dataSource.getRepository(ProductImage);
  for (const p of PRODUCTS) {
    if (await prodRepo.findOne({ where: { slug: p.slug } })) continue;
    const product = await prodRepo.save(
      prodRepo.create({
        slug: p.slug,
        name: p.name,
        categoryId: cats.get(p.category)?.id ?? null,
        color: p.color,
        colorHex: p.colorHex,
        price: p.price,
        mainImage: p.mainImage,
        fitNote: p.fitNote,
        details: p.details,
        care: p.care,
        dropName: p.dropName,
        isFeatured: p.isFeatured,
        position: p.position,
        status: ProductStatus.ACTIVE,
        translations: p.translations,
      }),
    );
    await varRepo.save(
      p.sizes.map((size, i) =>
        varRepo.create({
          productId: product.id,
          size,
          color: p.color,
          sku: `${p.slug}-${size}`.toUpperCase(),
          stock: 12,
          position: i,
        }),
      ),
    );
    await imgRepo.save(
      p.images.map((imageUrl, i) =>
        imgRepo.create({
          productId: product.id,
          imageUrl,
          position: i,
          alt: p.name,
        }),
      ),
    );
  }
  log(`${PRODUCTS.length} products (with variants & images)`);

  // 3b) Shop the Look
  const lookRepo = dataSource.getRepository(Look);
  const lookItemRepo = dataSource.getRepository(LookItem);
  if ((await lookRepo.count()) === 0) {
    for (const [i, l] of LOOKS.entries()) {
      const look = await lookRepo.save(
        lookRepo.create({
          title: l.title,
          translations: l.translations,
          imageUrl: l.imageUrl,
          imageWidth: l.imageWidth,
          imageHeight: l.imageHeight,
          bundleDiscountPercent: l.bundleDiscountPercent,
          isPublished: true,
          position: i + 1,
        }),
      );
      for (const [j, it] of l.items.entries()) {
        const product = await prodRepo.findOne({ where: { slug: it.slug } });
        if (!product) continue;
        await lookItemRepo.save(
          lookItemRepo.create({
            lookId: look.id,
            productId: product.id,
            x: it.x,
            y: it.y,
            position: j,
          }),
        );
      }
    }
  }
  log(`${LOOKS.length} looks`);

  // 4) Маркетинг
  const campRepo = dataSource.getRepository(Campaign);
  const campaigns = new Map<string, Campaign>();
  for (const c of CAMPAIGNS) {
    let camp = await campRepo.findOne({ where: { name: c.name } });
    if (!camp) {
      camp = await campRepo.save(
        campRepo.create({ ...c, status: c.status as CampaignStatus }),
      );
    }
    campaigns.set(c.name, camp);
  }
  log(`${campaigns.size} campaigns`);

  const assetRepo = dataSource.getRepository(CampaignAsset);
  for (const a of ASSETS) {
    if (await assetRepo.findOne({ where: { name: a.name } })) continue;
    await assetRepo.save(
      assetRepo.create({
        name: a.name,
        type: a.type as AssetType,
        url: a.url,
        thumbnailUrl: a.url,
        impressions: a.impressions,
        engagement: a.engagement,
        ctr: a.ctr,
        size: a.size as AssetSize,
        campaignId: campaigns.get(a.campaign)?.id ?? null,
      }),
    );
  }
  log(`${ASSETS.length} campaign assets`);

  const segRepo = dataSource.getRepository(AudienceSegment);
  for (const s of SEGMENTS) {
    if (!(await segRepo.findOne({ where: { name: s.name } }))) {
      await segRepo.save(segRepo.create(s));
    }
  }
  log(`${SEGMENTS.length} audience segments`);

  const chRepo = dataSource.getRepository(ChannelBudget);
  for (const b of CHANNEL_BUDGETS) {
    if (!(await chRepo.findOne({ where: { channel: b.channel } }))) {
      await chRepo.save(chRepo.create(b));
    }
  }
  const setRepo = dataSource.getRepository(BudgetSettings);
  if (!(await setRepo.findOne({ where: { id: 1 } }))) {
    await setRepo.save(setRepo.create({ id: 1, ...BUDGET }));
  }
  const txRepo = dataSource.getRepository(BudgetTransaction);
  if ((await txRepo.count()) === 0) {
    await txRepo.save(
      TRANSACTIONS.map((t) =>
        txRepo.create({
          description: t.description,
          amount: t.amount,
          channel: t.channel,
          occurredAt: new Date(Date.now() - t.daysAgo * 86400000),
        }),
      ),
    );
  }
  log('budget settings, channel budgets, transactions');

  await dataSource.destroy();
  console.log('🌱 Done');
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});

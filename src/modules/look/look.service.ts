import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Look } from './entities/look.entity';
import { LookItem } from './entities/look-item.entity';
import { LookPricing, SaveLookInput } from './dto/look.inputs';
import { Product, ProductStatus } from '../catalog/entities/product.entity';

@Injectable()
export class LookService {
  constructor(
    @InjectRepository(Look) private readonly lookRepo: Repository<Look>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  private query() {
    return this.lookRepo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.items', 'i')
      .leftJoinAndSelect('i.product', 'p')
      .orderBy('l.position', 'ASC')
      .addOrderBy('l.id', 'DESC')
      .addOrderBy('i.position', 'ASC');
  }

  /** Дэлгүүр: нийтлэгдсэн лукууд, зөвхөн идэвхтэй бараатай цэгүүд */
  async published(): Promise<Look[]> {
    const looks = await this.query()
      .where('l.isPublished = :pub', { pub: true })
      .getMany();
    for (const l of looks) {
      l.items = l.items.filter(
        (i) => i.product?.status === ProductStatus.ACTIVE,
      );
    }
    return looks;
  }

  all(): Promise<Look[]> {
    return this.query().getMany();
  }

  async findOne(id: number): Promise<Look> {
    const look = await this.query().where('l.id = :id', { id }).getOne();
    if (!look) throw new NotFoundException('Лук олдсонгүй');
    return look;
  }

  pricing(look: Look): LookPricing {
    const total = (look.items ?? []).reduce(
      (s, i) => s + Number(i.product?.price ?? 0),
      0,
    );
    const discount = Math.round(
      (total * (look.bundleDiscountPercent || 0)) / 100,
    );
    return { total, discount, bundlePrice: total - discount };
  }

  async save(input: SaveLookInput): Promise<Look> {
    const productIds = [...new Set(input.items.map((i) => i.productId))];
    if (productIds.length !== input.items.length) {
      throw new BadRequestException('Нэг бараа лук дээр хоёр удаа орсон байна');
    }
    if (productIds.length) {
      const found = await this.productRepo.count({
        where: { id: In(productIds) },
      });
      if (found !== productIds.length)
        throw new BadRequestException('Бараа олдсонгүй');
    }

    const id = await this.dataSource.transaction(async (em) => {
      let look: Look;
      if (input.id) {
        const existing = await em.findOne(Look, { where: { id: input.id } });
        if (!existing) throw new NotFoundException('Лук олдсонгүй');
        look = existing;
      } else {
        const max = await em
          .createQueryBuilder(Look, 'l')
          .select('COALESCE(MAX(l.position), 0)', 'm')
          .getRawOne<{ m: number }>();
        look = em.create(Look, { position: Number(max?.m ?? 0) + 1 });
      }
      look.title = input.title.trim();
      look.translations = input.translations ?? null;
      look.imageUrl = input.imageUrl;
      look.imageWidth = input.imageWidth ?? null;
      look.imageHeight = input.imageHeight ?? null;
      look.bundleDiscountPercent = input.bundleDiscountPercent ?? 0;
      look.isPublished = input.isPublished ?? false;
      const saved = await em.save(Look, { ...look, items: undefined });

      await em.delete(LookItem, { lookId: saved.id });
      if (input.items.length) {
        await em.save(
          LookItem,
          input.items.map((it, i) =>
            em.create(LookItem, {
              lookId: saved.id,
              productId: it.productId,
              x: Math.round(it.x * 1000) / 1000,
              y: Math.round(it.y * 1000) / 1000,
              position: i,
            }),
          ),
        );
      }
      return saved.id;
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<boolean> {
    const res = await this.lookRepo.delete(id);
    return !!res.affected;
  }

  async reorder(ids: number[]): Promise<Look[]> {
    await this.dataSource.transaction(async (em) => {
      for (const [i, id] of ids.entries()) {
        await em.update(Look, id, { position: i + 1 });
      }
    });
    return this.all();
  }
}

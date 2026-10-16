import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Product, ProductStatus } from '../entities/product.entity';
import { StoreProductsFilter } from '../dto/catalog.inputs';

/**
 * kueneree (дэлгүүр)-д зориулсан нийтийн уншилт.
 * Зөвхөн ACTIVE бараа, идэвхтэй ангиллыг буцаана.
 */
@Injectable()
export class StorefrontService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  categories(): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { isActive: true },
      order: { position: 'ASC', name: 'ASC' },
    });
  }

  async products(
    filter: StoreProductsFilter = {},
  ): Promise<{ items: Product[]; total: number }> {
    const limit = Math.min(filter.limit ?? 24, 100);
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('p.images', 'img')
      .leftJoinAndSelect('p.variants', 'v')
      .where('p.status = :status', { status: ProductStatus.ACTIVE });

    if (filter.categorySlug) {
      qb.andWhere('c.slug = :slug', { slug: filter.categorySlug });
    }
    if (filter.dropName) {
      qb.andWhere('p.dropName = :drop', { drop: filter.dropName });
    }
    if (filter.featured !== undefined && filter.featured !== null) {
      qb.andWhere('p.isFeatured = :f', { f: filter.featured });
    }
    if (filter.search) {
      qb.andWhere('p.name LIKE :q', { q: `%${filter.search}%` });
    }

    qb.orderBy('p.position', 'ASC')
      .addOrderBy('p.createdAt', 'DESC')
      .addOrderBy('img.position', 'ASC')
      .addOrderBy('v.position', 'ASC')
      .skip(filter.offset ?? 0)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async productBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('p.images', 'img')
      .leftJoinAndSelect('p.variants', 'v')
      .where('p.slug = :slug', { slug })
      .andWhere('p.status = :status', { status: ProductStatus.ACTIVE })
      .orderBy('img.position', 'ASC')
      .addOrderBy('v.position', 'ASC')
      .getOne();
    if (!product) throw new NotFoundException('Бараа олдсонгүй');
    return product;
  }

  /** "Complete the look" — ижил дропын бусад бараа */
  async related(productId: number, limit = 4): Promise<Product[]> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) return [];
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.images', 'img')
      .where('p.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('p.id != :id', { id: productId });
    if (product.dropName) {
      qb.andWhere('p.dropName = :drop', { drop: product.dropName });
    } else if (product.categoryId) {
      qb.andWhere('p.categoryId = :cid', { cid: product.categoryId });
    }
    return qb.orderBy('p.position', 'ASC').take(limit).getMany();
  }
}

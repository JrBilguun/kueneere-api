import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, In, Not } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/product-image.entity';
import { Variant } from '../entities/variant.entity';
import { SaveProductInput } from '../dto/catalog.inputs';
import { slugify } from '../../../common/utils/slug.util';

/**
 * kueneere-admin-ий барааны засварлагчид зориулсан "нэг товчоор хадгалах".
 * Бараа + зургийн дараалал + хэмжээ/үлдэгдлийг нэг транзакцид синк хийнэ.
 */
@Injectable()
export class ProductAdminService {
  constructor(private readonly dataSource: DataSource) {}

  async save(input: SaveProductInput): Promise<Product> {
    const { id, images, variants, ...fields } = input;

    const productId = await this.dataSource.transaction(async (em) => {
      let product: Product;
      if (id) {
        const existing = await em.findOne(Product, { where: { id } });
        if (!existing) throw new NotFoundException('Бараа олдсонгүй');
        product = existing;
      } else {
        product = em.create(Product, {});
      }

      Object.assign(product, fields);
      product.slug = await this.uniqueSlug(
        em,
        fields.slug || product.slug || slugify(fields.name),
        product.id,
      );
      if (fields.categoryId === undefined && !id) product.categoryId = null;

      if (images) {
        product.mainImage = images[0]?.imageUrl ?? null;
      }
      product = await em.save(Product, product);

      if (images) {
        await em.delete(ProductImage, { productId: product.id });
        if (images.length) {
          await em.save(
            ProductImage,
            images.map((img, i) =>
              em.create(ProductImage, {
                productId: product.id,
                imageUrl: img.imageUrl,
                alt: img.alt ?? product.name,
                position: i,
              }),
            ),
          );
        }
      }

      if (variants) {
        await this.syncVariants(em, product, variants);
      }
      return product.id;
    });

    return this.dataSource.getRepository(Product).findOneOrFail({
      where: { id: productId },
      relations: ['category', 'images', 'variants'],
      order: { images: { position: 'ASC' }, variants: { position: 'ASC' } },
    });
  }

  private async syncVariants(
    em: EntityManager,
    product: Product,
    variants: NonNullable<SaveProductInput['variants']>,
  ) {
    const seen = new Set<string>();
    for (const v of variants) {
      const key = `${v.size.trim().toUpperCase()}|${(v.color ?? '').trim()}`;
      if (seen.has(key)) {
        throw new BadRequestException(`Давхардсан хэмжээ: ${v.size}`);
      }
      seen.add(key);
    }

    const keepIds = variants.filter((v) => v.id).map((v) => v.id);
    await em.delete(Variant, {
      productId: product.id,
      ...(keepIds.length ? { id: Not(In(keepIds)) } : {}),
    });

    for (const [i, v] of variants.entries()) {
      const data = {
        productId: product.id,
        size: v.size.trim().toUpperCase(),
        color: (v.color ?? product.color ?? '').trim(),
        sku: v.sku?.trim() || null,
        stock: v.stock,
        price: v.price ?? null,
        position: i,
      };
      try {
        if (v.id) {
          const res = await em.update(
            Variant,
            { id: v.id, productId: product.id },
            data,
          );
          if (!res.affected) throw new NotFoundException('Variant олдсонгүй');
        } else {
          await em.save(Variant, em.create(Variant, data));
        }
      } catch (err) {
        if ((err as { code?: string }).code === 'ER_DUP_ENTRY') {
          throw new ConflictException(
            `SKU эсвэл хэмжээ давхардаж байна: ${data.sku ?? data.size}`,
          );
        }
        throw err;
      }
    }
  }

  private async uniqueSlug(
    em: EntityManager,
    base: string,
    selfId?: number,
  ): Promise<string> {
    const root = slugify(base) || 'product';
    let slug = root;
    for (let n = 2; ; n++) {
      const hit = await em.findOne(Product, { where: { slug } });
      if (!hit || hit.id === selfId) return slug;
      slug = `${root}-${n}`;
    }
  }
}

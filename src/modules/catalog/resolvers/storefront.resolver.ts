import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { StorefrontService } from '../services/storefront.service';
import { StoreProductsFilter } from '../dto/catalog.inputs';
import { StoreProductList } from '../dto/store-product-list.dto';

/**
 * Нийтийн (нэвтрэлтгүй) query-ууд — kueneree дэлгүүр ашиглана.
 */
@Resolver()
export class StorefrontResolver {
  constructor(private readonly storefront: StorefrontService) {}

  @Query(() => [Category], { description: 'Идэвхтэй ангиллууд' })
  storeCategories(): Promise<Category[]> {
    return this.storefront.categories();
  }

  @Query(() => StoreProductList, { description: 'Дэлгүүрийн бараанууд' })
  storeProducts(
    @Args('filter', { type: () => StoreProductsFilter, nullable: true })
    filter?: StoreProductsFilter,
  ): Promise<StoreProductList> {
    return this.storefront.products(filter ?? {});
  }

  @Query(() => Product, { description: 'Slug-аар бараа (барааны хуудас)' })
  storeProduct(@Args('slug') slug: string): Promise<Product> {
    return this.storefront.productBySlug(slug);
  }

  @Query(() => [Product], { description: 'Complete the look' })
  storeRelatedProducts(
    @Args('productId', { type: () => Int }) productId: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 4 })
    limit: number,
  ): Promise<Product[]> {
    return this.storefront.related(productId, Math.min(limit, 12));
  }
}

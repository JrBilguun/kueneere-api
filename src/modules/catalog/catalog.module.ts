import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { Variant } from './entities/variant.entity';
import { ProductImage } from './entities/product-image.entity';
import {
  CategoryService,
  ProductImageService,
  ProductService,
  VariantService,
} from './services/catalog.services';
import { StorefrontService } from './services/storefront.service';
import { ProductAdminService } from './services/product-admin.service';
import {
  CategoryResolver,
  ProductImageResolver,
  ProductResolver,
  VariantResolver,
} from './resolvers/catalog-admin.resolvers';
import { StorefrontResolver } from './resolvers/storefront.resolver';
import { noopAuthorizers } from '../../common/auth/noop-authorizers';

const entities = [Category, Product, Variant, ProductImage];

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    NestjsQueryTypeOrmModule.forFeature(entities),
  ],
  providers: [
    ...noopAuthorizers('Category', 'Product', 'Variant', 'ProductImage'),
    CategoryService,
    ProductService,
    VariantService,
    ProductImageService,
    StorefrontService,
    ProductAdminService,
    CategoryResolver,
    ProductResolver,
    VariantResolver,
    ProductImageResolver,
    StorefrontResolver,
  ],
  exports: [ProductService, VariantService, TypeOrmModule],
})
export class CatalogModule {}

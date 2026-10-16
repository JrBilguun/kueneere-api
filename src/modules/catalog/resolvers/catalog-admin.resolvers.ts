import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductAdminService } from '../services/product-admin.service';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { Variant } from '../entities/variant.entity';
import { ProductImage } from '../entities/product-image.entity';
import {
  CategoryService,
  ProductImageService,
  ProductService,
  VariantService,
} from '../services/catalog.services';
import {
  CreateCategoryInput,
  CreateProductImageInput,
  CreateProductInput,
  CreateVariantInput,
  UpdateCategoryInput,
  UpdateProductImageInput,
  UpdateProductInput,
  SaveProductInput,
  UpdateVariantInput,
} from '../dto/catalog.inputs';
import { GqlAuthGuard } from '../../../common/guards/gql-auth.guard';
import {
  StaffGuard,
  StoreManagerGuard,
} from '../../../common/guards/role.guard';

/**
 * Админ CRUD (nestjs-query) — kueneere-admin ашиглана.
 *   Унших: admin | manager | marketer
 *   Бичих: admin | manager
 *
 * Дэлгүүрийн (public) query-ууд нь storefront.resolver.ts-д байна.
 */
const staffRead = { guards: [GqlAuthGuard, StaffGuard], maxResultsSize: 500 };
const managerWrite = { guards: [GqlAuthGuard, StoreManagerGuard] };
const common = {
  enableTotalCount: true,
  pagingStrategy: PagingStrategies.OFFSET as const,
  read: staffRead,
  create: managerWrite,
  update: managerWrite,
  delete: managerWrite,
};

@Resolver(() => Category)
export class CategoryResolver extends CRUDResolver(Category, {
  ...common,
  CreateDTOClass: CreateCategoryInput,
  UpdateDTOClass: UpdateCategoryInput,
}) {
  constructor(readonly service: CategoryService) {
    super(service);
  }
}

@Resolver(() => Product)
export class ProductResolver extends CRUDResolver(Product, {
  ...common,
  CreateDTOClass: CreateProductInput,
  UpdateDTOClass: UpdateProductInput,
}) {
  constructor(
    readonly service: ProductService,
    private readonly productAdmin: ProductAdminService,
  ) {
    super(service);
  }

  @UseGuards(GqlAuthGuard, StoreManagerGuard)
  @Mutation(() => Product, {
    description: 'Бараа + зураг + хэмжээ/үлдэгдлийг нэг дор хадгалах (admin)',
  })
  saveProduct(@Args('input') input: SaveProductInput): Promise<Product> {
    return this.productAdmin.save(input);
  }
}

@Resolver(() => Variant)
export class VariantResolver extends CRUDResolver(Variant, {
  ...common,
  CreateDTOClass: CreateVariantInput,
  UpdateDTOClass: UpdateVariantInput,
}) {
  constructor(readonly service: VariantService) {
    super(service);
  }
}

@Resolver(() => ProductImage)
export class ProductImageResolver extends CRUDResolver(ProductImage, {
  ...common,
  CreateDTOClass: CreateProductImageInput,
  UpdateDTOClass: UpdateProductImageInput,
}) {
  constructor(readonly service: ProductImageService) {
    super(service);
  }
}

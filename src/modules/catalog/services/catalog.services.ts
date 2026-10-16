import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { DeepPartial } from '@ptc-org/nestjs-query-core';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { Variant } from '../entities/variant.entity';
import { ProductImage } from '../entities/product-image.entity';
import { slugify } from '../../../common/utils/slug.util';

@Injectable()
export class CategoryService extends TypeOrmQueryService<Category> {
  constructor(@InjectRepository(Category) repo: Repository<Category>) {
    super(repo);
  }

  createOne(record: DeepPartial<Category>): Promise<Category> {
    if (!record.slug && record.name) record.slug = slugify(record.name);
    return super.createOne(record);
  }
}

@Injectable()
export class ProductService extends TypeOrmQueryService<Product> {
  constructor(@InjectRepository(Product) repo: Repository<Product>) {
    super(repo);
  }

  createOne(record: DeepPartial<Product>): Promise<Product> {
    if (!record.slug && record.name) record.slug = slugify(record.name);
    return super.createOne(record);
  }
}

@Injectable()
export class VariantService extends TypeOrmQueryService<Variant> {
  constructor(@InjectRepository(Variant) repo: Repository<Variant>) {
    super(repo);
  }
}

@Injectable()
export class ProductImageService extends TypeOrmQueryService<ProductImage> {
  constructor(@InjectRepository(ProductImage) repo: Repository<ProductImage>) {
    super(repo);
  }
}

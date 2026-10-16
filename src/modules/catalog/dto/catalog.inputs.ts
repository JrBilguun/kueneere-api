import { InputType, Field, Int, Float, PartialType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../entities/product.entity';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MSG = 'slug зөвхөн жижиг латин үсэг, тоо, зураас (-) агуулна';

// ── Category ────────────────────────────────────────
@InputType('CreateCategoryInput')
export class CreateCategoryInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @Field({ nullable: true, description: 'Хоосон бол нэрээс автоматаар үүснэ' })
  @IsOptional()
  @Matches(SLUG, { message: SLUG_MSG })
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  position?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  translations?: Record<string, Record<string, string>>;
}

@InputType('UpdateCategoryInput')
export class UpdateCategoryInput extends PartialType(CreateCategoryInput) {}

// ── Product ─────────────────────────────────────────
@InputType('CreateProductInput')
export class CreateProductInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @Field({ nullable: true, description: 'Хоосон бол нэрээс автоматаар үүснэ' })
  @IsOptional()
  @Matches(SLUG, { message: SLUG_MSG })
  slug?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  details?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  care?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  fitNote?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  color?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Matches(/^#[0-9a-fA-F]{3,8}$/, { message: 'colorHex жишээ: #1a1a1a' })
  colorHex?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  mainImage?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dropName?: string;

  @Field(() => ProductStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  position?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  translations?: Record<string, Record<string, string>>;
}

@InputType('UpdateProductInput')
export class UpdateProductInput extends PartialType(CreateProductInput) {}

// ── Variant ─────────────────────────────────────────
@InputType('CreateVariantInput')
export class CreateVariantInput {
  @Field(() => Int)
  @IsInt()
  productId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @Field({ description: 'XS / S / M / L / XL / OS' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  size: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  color?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  position?: number;
}

@InputType('UpdateVariantInput')
export class UpdateVariantInput extends PartialType(CreateVariantInput) {}

// ── ProductImage ────────────────────────────────────
@InputType('CreateProductImageInput')
export class CreateProductImageInput {
  @Field(() => Int)
  @IsInt()
  productId: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  imageUrl: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  alt?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  position?: number;
}

@InputType('UpdateProductImageInput')
export class UpdateProductImageInput extends PartialType(
  CreateProductImageInput,
) {}

// ── Storefront query args ───────────────────────────
@InputType('StoreProductsFilter')
export class StoreProductsFilter {
  @Field({ nullable: true, description: 'Ангиллын slug' })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  dropName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @Field({ nullable: true, description: 'Нэрээр хайх' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @Field(() => Int, { nullable: true, defaultValue: 24 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

// ── Admin: нэг дуудлагаар бараа + зураг + variant хадгалах ──
@InputType('SaveProductImageInput')
export class SaveProductImageInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  imageUrl: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  alt?: string;
}

@InputType('SaveVariantInput')
export class SaveVariantInput {
  @Field(() => Int, { nullable: true, description: 'Байгаа variant бол id' })
  @IsOptional()
  @IsInt()
  id?: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  size: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  color?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  stock: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}

@InputType('SaveProductInput')
export class SaveProductInput extends CreateProductInput {
  @Field(() => Int, {
    nullable: true,
    description: 'Хоосон бол шинээр үүсгэнэ',
  })
  @IsOptional()
  @IsInt()
  id?: number;

  @Field(() => [SaveProductImageInput], {
    nullable: true,
    description: 'Дарааллаараа хадгална; эхнийх нь mainImage болно',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SaveProductImageInput)
  images?: SaveProductImageInput[];

  @Field(() => [SaveVariantInput], {
    nullable: true,
    description: 'Жагсаалтад байхгүй variant устгагдана',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SaveVariantInput)
  variants?: SaveVariantInput[];
}

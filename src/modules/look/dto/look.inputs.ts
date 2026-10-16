import { InputType, Field, Int, Float, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

@InputType()
export class LookItemInput {
  @Field(() => Int)
  @IsInt()
  productId: number;

  @Field(() => Float, { description: '0..100 % (зүүнээс)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  x: number;

  @Field(() => Float, { description: '0..100 % (дээрээс)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  y: number;
}

@InputType()
export class SaveLookInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  id?: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  translations?: Record<string, { title?: string }>;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  imageUrl: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  imageWidth?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  imageHeight?: number;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  bundleDiscountPercent?: number;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @Field(() => [LookItemInput])
  @ValidateNested({ each: true })
  @Type(() => LookItemInput)
  @ArrayMaxSize(20)
  items: LookItemInput[];
}

@InputType()
export class AddLookToCartItemInput {
  @Field(() => Int)
  @IsInt()
  productId: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  variantId?: number;
}

@InputType()
export class AddLookToCartInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  cartToken?: string;

  @Field(() => Int)
  @IsInt()
  lookId: number;

  @Field(() => [AddLookToCartItemInput])
  @ValidateNested({ each: true })
  @Type(() => AddLookToCartItemInput)
  @ArrayMaxSize(20)
  items: AddLookToCartItemInput[];
}

/** Лукийн үнийн тооцоо (бараануудын үнээс автоматаар) */
@ObjectType()
export class LookPricing {
  @Field(() => Float)
  total: number;

  @Field(() => Float)
  discount: number;

  @Field(() => Float)
  bundlePrice: number;
}

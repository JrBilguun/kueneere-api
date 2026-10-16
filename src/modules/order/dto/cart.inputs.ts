import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Max,
  Min,
} from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

@InputType()
export class AddToCartInput {
  @Field({ nullable: true, description: 'Зочин сагсны token (нэвтрээгүй үед)' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  cartToken?: string;

  @Field(() => Int)
  @IsInt()
  productId: number;

  @Field(() => Int, { nullable: true, description: 'Хэмжээ/өнгөний variant' })
  @IsOptional()
  @IsInt()
  variantId?: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;
}

@InputType()
export class UpdateCartItemInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  cartToken?: string;

  @Field(() => Int)
  @IsInt()
  lineItemId: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;
}

@InputType()
export class CheckoutInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  cartToken?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  customerName: string;

  @Field()
  @IsEmail({}, { message: 'Имэйл буруу байна' })
  email: string;

  @Field()
  @Matches(/^\+?\d{8,15}$/, { message: 'Утасны дугаар буруу байна' })
  phone: string;

  @Field({ defaultValue: 'Улаанбаатар' })
  @IsString()
  @MaxLength(100)
  city: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  district: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  khoroo?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  addressLine: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

@InputType()
export class TrackOrderInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  number: string;

  @Field()
  @IsEmail()
  email: string;
}

@InputType()
export class UpdateOrderStatusInput {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

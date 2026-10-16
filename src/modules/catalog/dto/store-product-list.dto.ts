import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Product } from '../entities/product.entity';

@ObjectType()
export class StoreProductList {
  @Field(() => [Product])
  items: Product[];

  @Field(() => Int)
  total: number;
}

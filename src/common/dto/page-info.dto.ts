import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType('LegacyPageInfo')
export class OffsetPageInfo {
  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;
}

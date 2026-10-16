import { Type } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';
import { OffsetPageInfo } from './page-info.dto';

export function PaginatedResponse<T>(classRef: Type<T>): unknown {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field(() => [classRef])
    items: T[];

    @Field(() => OffsetPageInfo)
    pageInfo: OffsetPageInfo;
  }

  return PaginatedType;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { Filter } from '@ptc-org/nestjs-query-core';
import {
  Authorizer,
  AuthorizationContext,
} from '@ptc-org/nestjs-query-graphql';

/**
 * No-op authorizer — returns empty filter.
 * Access control is handled by GqlAuthGuard on the resolver.
 * Use with @Authorize(NoOpAuthorizer) on entities.
 */
@Injectable()
export class NoOpAuthorizer<T> implements Authorizer<T> {
  authorize(
    _context: unknown,
    _authorizerContext: AuthorizationContext,
  ): Promise<Filter<T>> {
    return Promise.resolve({});
  }

  authorizeRelation(
    _relationName: string,
    _context: unknown,
    _authorizerContext: AuthorizationContext,
  ): Promise<Filter<unknown> | undefined> {
    return Promise.resolve(undefined);
  }
}

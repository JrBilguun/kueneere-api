import { Provider } from '@nestjs/common';
import { NoOpAuthorizer } from './no-op.authorizer';

/**
 * nestjs-query CRUDResolver бүр `<DTO>Authorizer` provider хайдаг.
 * Хандалтын хяналтыг guard-аар (GqlAuthGuard + RoleGuard) хийдэг тул
 * khurd-api-тай адил NoOpAuthorizer өгнө.
 *
 *   providers: [...noopAuthorizers('Product', 'Category')]
 */
export const noopAuthorizers = (...dtoNames: string[]): Provider[] =>
  dtoNames.map((name) => ({
    provide: `${name}Authorizer`,
    useClass: NoOpAuthorizer,
  }));

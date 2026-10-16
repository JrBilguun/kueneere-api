import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlAuthGuard } from './gql-auth.guard';

/**
 * Optional GraphQL Auth Guard
 *
 * Токен ирвэл хэрэглэгчийг req.user-д хавсаргана, ирэхгүй (эсвэл буруу) бол
 * зүгээр нэвтрүүлнэ. Зочин (guest) сагс / checkout-д ашиглана.
 */
@Injectable()
export class OptionalGqlAuthGuard extends GqlAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
    } catch {
      // токенгүй эсвэл хүчингүй — зочин гэж үзнэ
    }
    return true;
  }

  handleRequest<TUser = any>(_err: unknown, user: TUser): TUser | null {
    return user ?? null;
  }
}

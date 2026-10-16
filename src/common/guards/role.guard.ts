import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { hasAnyRole } from '../utils/roles.util';
import { STAFF_ROLES, Role } from '../constants/roles';

/**
 * RoleGuard(...roles) — decorator-гүйгээр шууд class болгон дамжуулж болох
 * guard. nestjs-query-ийн CRUDResolver `guards: [...]` тохиргоонд хэрэгтэй.
 *
 *   @UseGuards(GqlAuthGuard, RoleGuard(Role.ADMIN))
 *   CRUDResolver(Product, { create: { guards: [GqlAuthGuard, AdminGuard] } })
 *
 * `admin` эрх үргэлж бүх зүйлд нэвтэрнэ.
 */
export function RoleGuard(...roles: string[]): Type<CanActivate> {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const req =
        context.getType<string>() === 'graphql'
          ? GqlExecutionContext.create(context).getContext<{
              req: { user?: { roles: string[] } };
            }>().req
          : context.switchToHttp().getRequest<{ user?: { roles: string[] } }>();
      const user = req?.user;
      if (!user) throw new ForbiddenException('Нэвтрээгүй байна');
      if (hasAnyRole(user.roles, Role.ADMIN, ...roles)) return true;
      throw new ForbiddenException('Танд энэ үйлдлийг хийх эрх байхгүй');
    }
  }
  return mixin(RoleGuardMixin);
}

/** Зөвхөн admin */
export const AdminGuard = RoleGuard(Role.ADMIN);

/** Ажилтан (admin | manager | marketer) — admin самбарт нэвтрэх эрх */
export const StaffGuard = RoleGuard(...STAFF_ROLES);

/** Маркетингийн модуль (admin | marketer) */
export const MarketingGuard = RoleGuard(Role.MARKETER);

/** Дэлгүүрийн удирдлага (admin | manager) — бараа, захиалга */
export const StoreManagerGuard = RoleGuard(Role.MANAGER);

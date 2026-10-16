import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { GraphQLError } from 'graphql';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: TUser, info: any): TUser {
    const isExpired =
      info?.name === 'TokenExpiredError' || info?.message === 'jwt expired';

    if (isExpired) {
      throw new GraphQLError('Token expired', {
        extensions: { code: 'TOKEN_EXPIRED' },
      });
    }

    if (err || !user) {
      throw err ?? new UnauthorizedException('Unauthorized');
    }

    return user;
  }
}

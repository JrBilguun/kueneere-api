import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPayload } from './dto/auth-payload.dto';
import { RefreshTokenInput } from './dto/refresh-token.input';
import {
  ChangePasswordInput,
  CreateStaffInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from './dto/auth.inputs';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { AdminGuard } from '../../common/guards/role.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  // ── Дэлгүүр (kueneree) ─────────────────────────────

  @Mutation(() => AuthPayload, { description: 'Шинэ хэрэглэгч бүртгүүлэх' })
  register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthPayload, { description: 'Имэйл + нууц үгээр нэвтрэх' })
  login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input.email, input.password);
  }

  @Mutation(() => AuthPayload, { description: 'Access token сэргээх' })
  refreshToken(@Args('input') input: RefreshTokenInput): Promise<AuthPayload> {
    return this.authService.refreshToken(input.refreshToken);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { description: 'Нэвтэрсэн хэрэглэгч' })
  me(@CurrentUser() user: User): Promise<User> {
    return this.authService.getMe(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User, { description: 'Профайл засах' })
  updateProfile(
    @CurrentUser() user: User,
    @Args('input') input: UpdateProfileInput,
  ): Promise<User> {
    return this.authService.updateProfile(user.id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { description: 'Нууц үг солих' })
  changePassword(
    @CurrentUser() user: User,
    @Args('input') input: ChangePasswordInput,
  ): Promise<boolean> {
    return this.authService.changePassword(user.id, input);
  }

  // ── Админ самбар (kueneere-admin) ──────────────────

  @Mutation(() => AuthPayload, {
    description: 'Админ самбарт нэвтрэх (admin / manager / marketer эрхтэй)',
  })
  adminLogin(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.adminLogin(input.email, input.password);
  }

  @UseGuards(GqlAuthGuard, AdminGuard)
  @Mutation(() => User, { description: 'Ажилтан нэмэх (зөвхөн admin)' })
  createStaff(@Args('input') input: CreateStaffInput): Promise<User> {
    return this.authService.createStaff(input);
  }
}

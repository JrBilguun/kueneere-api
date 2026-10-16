import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { JwtTokenService } from '../../common/services/jwt.service';
import {
  hashPassword,
  comparePassword,
} from '../../common/utils/password.util';
import { hasAnyRole, parseRoles } from '../../common/utils/roles.util';
import { STAFF_ROLES } from '../../common/constants/roles';
import { AuthPayload } from './dto/auth-payload.dto';
import {
  ChangePasswordInput,
  CreateStaffInput,
  RegisterInput,
  UpdateProfileInput,
} from './dto/auth.inputs';

const INVALID_CREDENTIALS = 'Нэвтрэх мэдээлэл буруу байна';

/**
 * Authentication Service (khurd-api-ийн AuthService-ийн хялбаршуулсан хувилбар)
 * - Имэйл + нууц үгээр бүртгүүлэх / нэвтрэх
 * - Admin самбарт нэвтрэх (staff эрх шалгана)
 * - Access / refresh token
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    if (!email) return null;
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user || !user.isActive) return null;
    const ok = await comparePassword(password, user.passwordHash);
    return ok ? user : null;
  }

  async register(input: RegisterInput): Promise<AuthPayload> {
    const user = await this.createUser(input, ['user']);
    return this.generatePayload(user);
  }

  async login(email: string, password: string): Promise<AuthPayload> {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException(INVALID_CREDENTIALS);
    await this.touchLogin(user);
    return this.generatePayload(user);
  }

  /** kueneere-admin-д зориулсан нэвтрэлт — staff эрхгүй бол татгалзана */
  async adminLogin(email: string, password: string): Promise<AuthPayload> {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException(INVALID_CREDENTIALS);
    if (!hasAnyRole(user.roles, ...STAFF_ROLES)) {
      throw new ForbiddenException('Админ самбарт нэвтрэх эрхгүй байна');
    }
    await this.touchLogin(user);
    return this.generatePayload(user);
  }

  async refreshToken(refreshToken: string): Promise<AuthPayload> {
    const payload = await this.jwtTokenService.verifyRefreshToken(refreshToken);
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.isActive) throw new UnauthorizedException('Account is inactive');

    const accessToken = await this.jwtTokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      roles: parseRoles(user.roles),
    });
    return {
      accessToken,
      refreshToken,
      user,
      expiresIn: this.jwtTokenService.getAccessTokenExpiresIn(),
    };
  }

  async getMe(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    return user;
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<User> {
    const user = await this.getMe(userId);
    if (input.mobile && input.mobile !== user.mobile) {
      const taken = await this.userRepository.findOne({
        where: { mobile: input.mobile },
      });
      if (taken) throw new ConflictException('Утасны дугаар бүртгэлтэй байна');
    }
    Object.assign(user, input);
    return this.userRepository.save(user);
  }

  async changePassword(
    userId: string,
    input: ChangePasswordInput,
  ): Promise<boolean> {
    const user = await this.getMe(userId);
    const ok = await comparePassword(input.currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Одоогийн нууц үг буруу');
    user.passwordHash = await hashPassword(input.newPassword);
    await this.userRepository.save(user);
    return true;
  }

  async createStaff(input: CreateStaffInput): Promise<User> {
    const roles = parseRoles(input.roles);
    return this.createUser(input, roles.length ? roles : ['manager']);
  }

  private async createUser(
    input: RegisterInput,
    roles: string[],
  ): Promise<User> {
    const email = input.email.toLowerCase().trim();
    if (await this.userRepository.findOne({ where: { email } })) {
      throw new ConflictException('Энэ имэйл бүртгэлтэй байна');
    }
    if (
      input.mobile &&
      (await this.userRepository.findOne({ where: { mobile: input.mobile } }))
    ) {
      throw new ConflictException('Утасны дугаар бүртгэлтэй байна');
    }
    const user = this.userRepository.create({
      email,
      passwordHash: await hashPassword(input.password),
      firstName: input.firstName,
      lastName: input.lastName,
      mobile: input.mobile ?? null,
      roles,
      isActive: true,
    });
    return this.userRepository.save(user);
  }

  private async touchLogin(user: User): Promise<void> {
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });
  }

  private async generatePayload(user: User): Promise<AuthPayload> {
    const { accessToken, refreshToken } =
      await this.jwtTokenService.generateTokens(
        user.id,
        user.email,
        parseRoles(user.roles),
      );
    return {
      accessToken,
      refreshToken,
      user,
      expiresIn: this.jwtTokenService.getAccessTokenExpiresIn(),
    };
  }
}

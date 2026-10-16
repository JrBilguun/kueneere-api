import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';

/**
 * Authentication Module
 * JwtModule / JwtTokenService нь CommonModule (global)-оос ирнэ.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [JwtStrategy, AuthService, AuthResolver],
  exports: [JwtStrategy, PassportModule, AuthService],
})
export class AuthModule {}

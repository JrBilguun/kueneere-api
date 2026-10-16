import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtTokenService } from './services/jwt.service';

/**
 * Common Module (Global)
 *
 * Бүх модульд хэрэгтэй JwtTokenService, JwtModule-ийг экспортлоно.
 */
@Global()
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn') as any,
        },
      }),
    }),
  ],
  providers: [JwtTokenService],
  exports: [JwtTokenService, JwtModule],
})
export class CommonModule {}

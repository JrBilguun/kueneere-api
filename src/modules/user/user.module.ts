import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { noopAuthorizers } from '../../common/auth/noop-authorizers';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [...noopAuthorizers('User'), UserService, UserResolver],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}

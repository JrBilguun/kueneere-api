import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService extends TypeOrmQueryService<User> {
  constructor(@InjectRepository(User) readonly repo: Repository<User>) {
    super(repo, { useSoftDelete: false });
  }
}

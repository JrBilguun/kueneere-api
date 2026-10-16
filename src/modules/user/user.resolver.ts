import { Resolver } from '@nestjs/graphql';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UpdateUserInput } from './dto/update-user.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { AdminGuard } from '../../common/guards/role.guard';

/**
 * Хэрэглэгчийн удирдлага — зөвхөн admin.
 *   query  users(paging, filter, sorting) / user(id)
 *   mutation updateOneUser / deleteOneUser
 * Шинэ ажилтан нэмэх нь auth.createStaff-аар хийгдэнэ (нууц үг hash-лах).
 */
@Resolver(() => User)
export class UserResolver extends CRUDResolver(User, {
  UpdateDTOClass: UpdateUserInput,
  enableTotalCount: true,
  pagingStrategy: PagingStrategies.OFFSET,
  read: { guards: [GqlAuthGuard, AdminGuard], maxResultsSize: 500 },
  create: { disabled: true },
  update: { guards: [GqlAuthGuard, AdminGuard], many: { disabled: true } },
  delete: { guards: [GqlAuthGuard, AdminGuard], many: { disabled: true } },
}) {
  constructor(readonly service: UserService) {
    super(service);
  }
}

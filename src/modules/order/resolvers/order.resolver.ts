import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { Order } from '../entities/order.entity';
import { OrderService } from '../services/order.service';
import { TrackOrderInput, UpdateOrderStatusInput } from '../dto/cart.inputs';
import { GqlAuthGuard } from '../../../common/guards/gql-auth.guard';
import {
  StaffGuard,
  StoreManagerGuard,
} from '../../../common/guards/role.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../user/entities/user.entity';

/**
 * Захиалга
 *   Админ: orders(filter: { status: { neq: basket } }, paging, sorting), order(id)
 *          updateOrderStatus
 *   Хэрэглэгч: myOrders, trackOrder (зочин — дугаар + имэйл)
 */
@Resolver(() => Order)
export class OrderResolver extends CRUDResolver(Order, {
  enableTotalCount: true,
  pagingStrategy: PagingStrategies.OFFSET,
  read: { guards: [GqlAuthGuard, StaffGuard], maxResultsSize: 500 },
  create: { disabled: true },
  update: { disabled: true },
  delete: { disabled: true },
}) {
  constructor(readonly service: OrderService) {
    super(service);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Order], { description: 'Миний захиалгууд' })
  myOrders(@CurrentUser() user: User): Promise<Order[]> {
    return this.service.myOrders(user.id);
  }

  @Query(() => Order, { description: 'Захиалга шалгах (дугаар + имэйл)' })
  trackOrder(@Args('input') input: TrackOrderInput): Promise<Order> {
    return this.service.track(input.number, input.email);
  }

  @UseGuards(GqlAuthGuard, StoreManagerGuard)
  @Mutation(() => Order, { description: 'Захиалгын статус солих (админ)' })
  updateOrderStatus(
    @Args('input') input: UpdateOrderStatusInput,
  ): Promise<Order> {
    return this.service.updateStatus(input.id, input.status);
  }
}

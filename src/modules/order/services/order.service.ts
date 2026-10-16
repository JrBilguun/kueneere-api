import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { CartService } from './cart.service';

/** Захиалгын статусын зөвшөөрөгдөх шилжилт */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.BASKET]: [],
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class OrderService extends TypeOrmQueryService<Order> {
  constructor(
    @InjectRepository(Order) readonly repo: Repository<Order>,
    private readonly cartService: CartService,
  ) {
    super(repo);
  }

  myOrders(userId: string): Promise<Order[]> {
    return this.repo.find({
      where: { userId, status: Not(OrderStatus.BASKET) },
      relations: ['lineItems'],
      order: { createdAt: 'DESC' },
    });
  }

  async track(number: string, email: string): Promise<Order> {
    const order = await this.repo.findOne({
      where: { number, email: email.toLowerCase() },
      relations: ['lineItems'],
    });
    if (!order) throw new NotFoundException('Захиалга олдсонгүй');
    return order;
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = await this.repo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Захиалга олдсонгүй');
    if (!TRANSITIONS[order.status].includes(status)) {
      throw new BadRequestException(
        `"${order.status}" → "${status}" шилжилт хийх боломжгүй`,
      );
    }
    if (status === OrderStatus.CANCELLED) {
      await this.cartService.restoreStock(order.id);
    }
    order.status = status;
    return this.repo.save(order);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { Order } from './entities/order.entity';
import { LineItem } from './entities/line-item.entity';
import { Product } from '../catalog/entities/product.entity';
import { Variant } from '../catalog/entities/variant.entity';
import { PaymentModule } from '../payment/payment.module';
import { Look } from '../look/entities/look.entity';
import { CartService } from './services/cart.service';
import { OrderService } from './services/order.service';
import { CartResolver } from './resolvers/cart.resolver';
import { OrderResolver } from './resolvers/order.resolver';
import { noopAuthorizers } from '../../common/auth/noop-authorizers';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, LineItem, Product, Variant, Look]),
    NestjsQueryTypeOrmModule.forFeature([Order, LineItem]),
    PaymentModule,
  ],
  providers: [
    ...noopAuthorizers('Order', 'LineItem'),
    CartService,
    OrderService,
    CartResolver,
    OrderResolver,
  ],
  exports: [CartService, OrderService],
})
export class OrderModule {}

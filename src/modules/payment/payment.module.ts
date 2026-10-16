import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import { QPayService } from './services/qpay.service';
import {
  PaymentResolver,
  PaymentService,
  QPayResolver,
} from './resolvers/payment.resolvers';
import { QpayController } from './qpay.controller';
import { noopAuthorizers } from '../../common/auth/noop-authorizers';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order]),
    NestjsQueryTypeOrmModule.forFeature([Payment]),
  ],
  controllers: [QpayController],
  providers: [
    ...noopAuthorizers('Payment'),
    PaymentService,
    QPayService,
    PaymentResolver,
    QPayResolver,
  ],
  exports: [QPayService, PaymentService],
})
export class PaymentModule {}

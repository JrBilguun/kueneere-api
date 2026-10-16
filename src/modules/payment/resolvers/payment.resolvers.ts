import { Resolver, Mutation, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { OptionalGqlAuthGuard } from '../../../common/guards/optional-gql-auth.guard';
import { GqlAuthGuard } from '../../../common/guards/gql-auth.guard';
import { StaffGuard } from '../../../common/guards/role.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../user/entities/user.entity';
import { QPayService } from '../services/qpay.service';
import { QPayInvoice, QPayPaymentStatus } from '../dto/qpay-invoice.dto';
import { Payment } from '../entities/payment.entity';

@Injectable()
export class PaymentService extends TypeOrmQueryService<Payment> {
  constructor(@InjectRepository(Payment) repo: Repository<Payment>) {
    super(repo);
  }
}

/** Админ: payments / payment(id) — зөвхөн унших */
@Resolver(() => Payment)
export class PaymentResolver extends CRUDResolver(Payment, {
  enableTotalCount: true,
  pagingStrategy: PagingStrategies.OFFSET,
  read: { guards: [GqlAuthGuard, StaffGuard], maxResultsSize: 500 },
  create: { disabled: true },
  update: { disabled: true },
  delete: { disabled: true },
}) {
  constructor(readonly service: PaymentService) {
    super(service);
  }
}

@Resolver()
@UseGuards(OptionalGqlAuthGuard)
export class QPayResolver {
  constructor(private readonly qpayService: QPayService) {}

  @Mutation(() => QPayInvoice, {
    description: 'Захиалгад QPay нэхэмжлэх үүсгэх',
  })
  createQPayInvoice(
    @CurrentUser() user: User | null,
    @Args('orderId', { type: () => Int }) orderId: number,
    @Args('cartToken', { nullable: true }) cartToken?: string,
  ): Promise<QPayInvoice> {
    return this.qpayService.createInvoice(orderId, {
      userId: user?.id ?? null,
      cartToken: cartToken ?? null,
    });
  }

  @Query(() => QPayPaymentStatus, { description: 'QPay төлөлт шалгах' })
  checkQPayPayment(
    @Args('invoiceId') invoiceId: string,
  ): Promise<QPayPaymentStatus> {
    return this.qpayService.checkPayment(invoiceId);
  }
}

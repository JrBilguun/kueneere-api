import { ObjectType, Field, Int } from '@nestjs/graphql';
import { QPayUrl } from '../../payment/dto/qpay-invoice.dto';
import { Order } from '../entities/order.entity';

@ObjectType()
export class CompleteCheckoutResponse {
  @Field(() => Order)
  order: Order;

  @Field(() => Int, { nullable: true })
  paymentId: number | null;

  @Field({ nullable: true })
  invoiceId: string | null;

  @Field({ nullable: true })
  qrText: string | null;

  @Field({ nullable: true })
  qrImage: string | null;

  @Field(() => [QPayUrl])
  urls: QPayUrl[];

  @Field({
    nullable: true,
    description: 'Захиалга үүссэн ч нэхэмжлэх үүсээгүй бол шалтгаан',
  })
  paymentError: string | null;
}

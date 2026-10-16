import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class QPayUrl {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  logo: string;

  @Field()
  link: string;
}

@ObjectType()
export class QPayInvoice {
  @Field()
  invoiceId: string;

  @Field()
  qrText: string;

  @Field()
  qrImage: string;

  @Field(() => [QPayUrl])
  urls: QPayUrl[];

  @Field(() => Int)
  paymentId: number;
}

@ObjectType()
export class QPayPaymentStatus {
  @Field()
  paid: boolean;

  @Field(() => Int)
  orderId: number;
}

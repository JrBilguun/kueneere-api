import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { QPay } from 'qpay';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import {
  Order,
  OrderStatus,
  PaymentState,
} from '../../order/entities/order.entity';

interface QPayUrl {
  name: string;
  description: string;
  logo: string;
  link: string;
}

interface CreateInvoiceResult {
  invoice_id: string;
  qr_text: string;
  qr_image: string;
  urls?: QPayUrl[];
  qpay_urls?: QPayUrl[];
}

interface GetInvoiceResult {
  invoice_status: string;
  payments?: Array<{ payment_status: string; payment_amount: number | string }>;
}

export interface OrderAccess {
  userId?: string | null;
  cartToken?: string | null;
}

/**
 * QPay (khurd-api-аас авсан). Тохиргоо байхгүй бол lazy байдлаар
 * ServiceUnavailable буцаана — апп асахад саад болохгүй.
 */
@Injectable()
export class QPayService {
  private readonly logger = new Logger(QPayService.name);
  private client: QPay | null = null;
  private readonly callbackUrl: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
  ) {
    this.callbackUrl = this.configService.get<string>(
      'QPAY_CALLBACK_URL',
      'http://localhost:3003/qpay/callback',
    );
  }

  private get qpay(): QPay {
    if (this.client) return this.client;
    const username = this.configService.get<string>('QPAY_USERNAME', '');
    const password = this.configService.get<string>('QPAY_PASSWORD', '');
    const invoice_code = this.configService.get<string>(
      'QPAY_INVOICE_CODE',
      '',
    );
    if (!username || !password || !invoice_code) {
      throw new ServiceUnavailableException('QPay тохируулагдаагүй байна');
    }
    this.client = new QPay({ username, password, invoice_code });
    return this.client;
  }

  /** Захиалгын нэхэмжлэх үүсгэх (эзэмшигч эсэхийг шалгана) */
  async createInvoice(orderId: number, access: OrderAccess) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Захиалга олдсонгүй');
    const allowed =
      (access.userId && order.userId === access.userId) ||
      (access.cartToken && order.cartToken === access.cartToken);
    if (!allowed) throw new ForbiddenException('Энэ захиалгад хандах эрхгүй');
    if (order.status === OrderStatus.BASKET) {
      throw new BadRequestException('Эхлээд checkout хийнэ үү');
    }
    if (order.paymentState === PaymentState.PAID) {
      throw new BadRequestException('Захиалга аль хэдийн төлөгдсөн');
    }

    const existing = await this.paymentRepo.findOne({
      where: {
        sourceId: orderId,
        sourceType: 'order',
        status: PaymentStatus.PENDING,
      },
    });
    if (existing?.transactionId && existing.data) {
      const d = existing.data as unknown as CreateInvoiceResult;
      return {
        invoiceId: existing.transactionId,
        qrText: d.qr_text ?? '',
        qrImage: d.qr_image ?? '',
        urls: d.urls ?? d.qpay_urls ?? [],
        paymentId: existing.id,
      };
    }

    const amount = Number(order.total);
    const result = await this.qpay.createInvoice({
      amount,
      callback_url: `${this.callbackUrl}/${orderId}`,
      invoice_description: `KUENEREE #${order.number}`,
      invoice_receiver_code: order.phone ?? order.email ?? 'guest',
      sender_invoice_no: order.number,
    });
    const data = result.data as unknown as CreateInvoiceResult;

    const payment = await this.paymentRepo.save(
      this.paymentRepo.create({
        ...(existing ? { id: existing.id } : {}),
        sourceId: orderId,
        sourceType: 'order',
        provider: 'qpay',
        amount,
        transactionId: data.invoice_id,
        status: PaymentStatus.PENDING,
        data: data as unknown as Record<string, unknown>,
      }),
    );
    this.logger.log(`QPay invoice ${data.invoice_id} → order #${order.number}`);

    return {
      invoiceId: data.invoice_id,
      qrText: data.qr_text,
      qrImage: data.qr_image,
      urls: data.urls ?? data.qpay_urls ?? [],
      paymentId: payment.id,
    };
  }

  /** QPay-ээс төлөлт шалгаж, бүртгэлээ шинэчилнэ */
  async checkPayment(
    invoiceId: string,
  ): Promise<{ paid: boolean; orderId: number }> {
    const payment = await this.paymentRepo.findOne({
      where: { transactionId: invoiceId },
    });
    if (!payment) throw new BadRequestException('Төлбөр олдсонгүй');
    if (payment.status === PaymentStatus.COMPLETED) {
      return { paid: true, orderId: payment.sourceId };
    }

    const result = await this.qpay.getInvoice(invoiceId);
    const data = result.data as unknown as GetInvoiceResult;
    const paidRow = data.payments?.find((r) => r.payment_status === 'PAID');
    if (!paidRow) return { paid: false, orderId: payment.sourceId };

    const order = await this.orderRepo.findOne({
      where: { id: payment.sourceId },
    });
    if (!order) throw new BadRequestException('Захиалга олдсонгүй');

    const paidAmount = Number(paidRow.payment_amount);
    if (paidAmount < Number(order.total)) {
      this.logger.warn(
        `Дутуу төлөлт: order ${order.id} paid ${paidAmount} / ${order.total}`,
      );
      return { paid: false, orderId: order.id };
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.paidAt = new Date();
    await this.paymentRepo.save(payment);
    await this.orderRepo.update(order.id, {
      status: OrderStatus.CONFIRMED,
      paymentState: PaymentState.PAID,
      paidAt: new Date(),
    });
    this.logger.log(`Order #${order.number} төлөгдлөө (${paidAmount}₮)`);
    return { paid: true, orderId: order.id };
  }

  /** QPay callback (REST) */
  async handleCallback(orderId: number): Promise<{ paid: boolean }> {
    const payment = await this.paymentRepo.findOne({
      where: { sourceId: orderId, sourceType: 'order' },
      order: { createdAt: 'DESC' },
    });
    if (!payment?.transactionId) {
      this.logger.warn(`Order ${orderId}-д хүлээгдэж буй төлбөр алга`);
      return { paid: false };
    }
    const { paid } = await this.checkPayment(payment.transactionId);
    return { paid };
  }
}

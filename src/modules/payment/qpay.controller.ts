import {
  Controller,
  Get,
  Post,
  Param,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import { QPayService } from './services/qpay.service';

/** QPay төлбөрийн callback — QPay сервер дуудна (GraphQL биш, REST) */
@Controller('qpay')
export class QpayController {
  private readonly logger = new Logger(QpayController.name);

  constructor(private readonly qpayService: QPayService) {}

  @Get('callback/:orderId')
  async handleGet(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.handle(orderId);
  }

  @Post('callback/:orderId')
  async handlePost(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.handle(orderId);
  }

  private async handle(orderId: number) {
    this.logger.log(`QPay callback: order ${orderId}`);
    const result = await this.qpayService.handleCallback(orderId);
    return { success: result.paid, orderId };
  }
}

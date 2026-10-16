import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OptionalGqlAuthGuard } from '../../../common/guards/optional-gql-auth.guard';
import { GqlAuthGuard } from '../../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../user/entities/user.entity';
import { Order } from '../entities/order.entity';
import { CartOwner, CartService } from '../services/cart.service';
import { QPayService } from '../../payment/services/qpay.service';
import {
  AddToCartInput,
  CheckoutInput,
  UpdateCartItemInput,
} from '../dto/cart.inputs';
import { CompleteCheckoutResponse } from '../dto/checkout.response';
import { AddLookToCartInput } from '../../look/dto/look.inputs';

const owner = (user: User | null, cartToken?: string | null): CartOwner => ({
  userId: user?.id ?? null,
  cartToken: user ? null : (cartToken ?? null),
});

/**
 * Сагс — нэвтэрсэн ч, зочин ч ашиглаж болно.
 * Зочин: эхний addToCart-ийн хариунд ирэх `cartToken`-ийг хадгалаад
 * дараагийн дуудлага бүрт дамжуулна.
 */
@Resolver(() => Order)
@UseGuards(OptionalGqlAuthGuard)
export class CartResolver {
  constructor(
    private readonly cartService: CartService,
    private readonly qpayService: QPayService,
  ) {}

  @Query(() => Order, { nullable: true, description: 'Одоогийн сагс' })
  cart(
    @CurrentUser() user: User | null,
    @Args('cartToken', { nullable: true }) cartToken?: string,
  ): Promise<Order | null> {
    return this.cartService.findBasket(owner(user, cartToken));
  }

  @Mutation(() => Order, { description: 'Сагсанд нэмэх' })
  addToCart(
    @CurrentUser() user: User | null,
    @Args('input') input: AddToCartInput,
  ): Promise<Order> {
    return this.cartService.addToCart(owner(user, input.cartToken), input);
  }

  @Mutation(() => Order, { description: 'Сагсны барааны тоо өөрчлөх' })
  updateCartItem(
    @CurrentUser() user: User | null,
    @Args('input') input: UpdateCartItemInput,
  ): Promise<Order> {
    return this.cartService.updateCartItem(owner(user, input.cartToken), input);
  }

  @Mutation(() => Order, { description: 'Сагснаас хасах' })
  removeFromCart(
    @CurrentUser() user: User | null,
    @Args('lineItemId', { type: () => Int }) lineItemId: number,
    @Args('cartToken', { nullable: true }) cartToken?: string,
  ): Promise<Order> {
    return this.cartService.removeFromCart(owner(user, cartToken), lineItemId);
  }

  @Mutation(() => Order, {
    description: 'Бүтэн лукийг сагсанд нэмэх (багц хямдралтай)',
  })
  addLookToCart(
    @CurrentUser() user: User | null,
    @Args('input') input: AddLookToCartInput,
  ): Promise<Order> {
    return this.cartService.addLookToCart(owner(user, input.cartToken), input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Order, {
    nullable: true,
    description: 'Нэвтэрсний дараа зочин сагсыг өөрийн сагстай нийлүүлэх',
  })
  mergeCart(
    @CurrentUser() user: User,
    @Args('cartToken') cartToken: string,
  ): Promise<Order | null> {
    return this.cartService.mergeGuestCart(user.id, cartToken);
  }

  @Mutation(() => Order, { description: 'Захиалга үүсгэх (basket → pending)' })
  checkout(
    @CurrentUser() user: User | null,
    @Args('input') input: CheckoutInput,
  ): Promise<Order> {
    return this.cartService.checkout(owner(user, input.cartToken), input);
  }

  @Mutation(() => CompleteCheckoutResponse, {
    description: 'Checkout + QPay нэхэмжлэх нэг алхамд',
  })
  async completeCheckout(
    @CurrentUser() user: User | null,
    @Args('input') input: CheckoutInput,
  ): Promise<CompleteCheckoutResponse> {
    const cartOwner = owner(user, input.cartToken);
    const order = await this.cartService.checkout(cartOwner, input);
    // Захиалга аль хэдийн үүссэн тул QPay алдаа гарсан ч захиалгыг буцаана
    try {
      const invoice = await this.qpayService.createInvoice(order.id, {
        userId: cartOwner.userId,
        cartToken: order.cartToken,
      });
      return {
        order,
        paymentId: invoice.paymentId,
        invoiceId: invoice.invoiceId,
        qrText: invoice.qrText,
        qrImage: invoice.qrImage,
        urls: invoice.urls,
        paymentError: null,
      };
    } catch (err) {
      return {
        order,
        paymentId: null,
        invoiceId: null,
        qrText: null,
        qrImage: null,
        urls: [],
        paymentError: err instanceof Error ? err.message : 'QPay алдаа',
      };
    }
  }
}

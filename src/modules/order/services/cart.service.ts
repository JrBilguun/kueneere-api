import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { Look } from '../../look/entities/look.entity';
import { AddLookToCartInput } from '../../look/dto/look.inputs';
import { randomBytes } from 'crypto';
import { Order, OrderStatus } from '../entities/order.entity';
import { LineItem } from '../entities/line-item.entity';
import { Product, ProductStatus } from '../../catalog/entities/product.entity';
import { Variant } from '../../catalog/entities/variant.entity';
import {
  AddToCartInput,
  CheckoutInput,
  UpdateCartItemInput,
} from '../dto/cart.inputs';

/** Сагсны эзэн: нэвтэрсэн хэрэглэгч эсвэл зочны cartToken */
export interface CartOwner {
  userId?: string | null;
  cartToken?: string | null;
}

const RELATIONS = ['lineItems'];

/**
 * Сагс & checkout (khurd-api CartService-ийн загвараар).
 * Зочин хэрэглэгч cartToken-оор, нэвтэрсэн хэрэглэгч userId-аар сагстай.
 */
@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(LineItem)
    private readonly lineItemRepo: Repository<LineItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Variant)
    private readonly variantRepo: Repository<Variant>,
    @InjectRepository(Look) private readonly lookRepo: Repository<Look>,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  // ── Сагс олох / үүсгэх ─────────────────────────────
  findBasket(owner: CartOwner): Promise<Order | null> {
    if (owner.userId) {
      return this.orderRepo.findOne({
        where: { userId: owner.userId, status: OrderStatus.BASKET },
        relations: RELATIONS,
      });
    }
    if (owner.cartToken) {
      return this.orderRepo.findOne({
        where: {
          cartToken: owner.cartToken,
          userId: IsNull(),
          status: OrderStatus.BASKET,
        },
        relations: RELATIONS,
      });
    }
    return Promise.resolve(null);
  }

  private async getOrCreateBasket(owner: CartOwner): Promise<Order> {
    const existing = await this.findBasket(owner);
    if (existing) return existing;
    const basket = this.orderRepo.create({
      userId: owner.userId ?? null,
      cartToken: randomBytes(24).toString('hex'),
      status: OrderStatus.BASKET,
      number: this.generateNumber('BSK'),
      itemTotal: 0,
      deliveryFee: 0,
      total: 0,
    });
    return this.orderRepo.save(basket);
  }

  // ── Сагсны үйлдлүүд ────────────────────────────────
  async addToCart(owner: CartOwner, input: AddToCartInput): Promise<Order> {
    const basket = await this.addLine(owner, input, null);
    return this.recalcAndLoad(basket.id);
  }

  /**
   * "Бүтэн лукийг авах" — лукийн бүх барааг (хэмжээтэй нь) нэг дор нэмж,
   * lookId-аар тэмдэглэнэ. Багцын хямдрал computeTotals дээр тооцогдоно.
   */
  async addLookToCart(
    owner: CartOwner,
    input: AddLookToCartInput,
  ): Promise<Order> {
    const look = await this.lookRepo.findOne({
      where: { id: input.lookId, isPublished: true },
      relations: ['items'],
    });
    if (!look) throw new BadRequestException('Лук олдсонгүй');
    const required = new Set(look.items.map((i) => i.productId));
    const given = new Set(input.items.map((i) => i.productId));
    for (const id of required) {
      if (!given.has(id))
        throw new BadRequestException('Лукийн бүх барааг сонгоно уу');
    }
    let basketId: number | null = null;
    for (const it of input.items) {
      if (!required.has(it.productId)) continue;
      const basket = await this.addLine(
        owner,
        { productId: it.productId, variantId: it.variantId, quantity: 1 },
        look.id,
      );
      basketId = basket.id;
      // зочин анх удаа: шинэ сагсны token-ийг дараагийн мөрөнд ашиглана
      if (!owner.userId && !owner.cartToken)
        owner = { cartToken: basket.cartToken };
    }
    if (!basketId) throw new BadRequestException('Бараа сонгогдоогүй');
    return this.recalcAndLoad(basketId);
  }

  private async addLine(
    owner: CartOwner,
    input: AddToCartInput,
    lookId: number | null,
  ): Promise<Order> {
    const product = await this.productRepo.findOne({
      where: { id: input.productId, status: ProductStatus.ACTIVE },
      relations: ['variants'],
    });
    if (!product) throw new BadRequestException('Бараа олдсонгүй');

    let variant: Variant | null = null;
    if (input.variantId) {
      variant = product.variants.find((v) => v.id === input.variantId) ?? null;
      if (!variant) throw new BadRequestException('Хэмжээ/өнгө олдсонгүй');
    } else if (product.variants.length > 0) {
      throw new BadRequestException('Хэмжээгээ сонгоно уу');
    }

    const basket = await this.getOrCreateBasket(owner);
    const existing = await this.lineItemRepo.findOne({
      where: {
        orderId: basket.id,
        productId: product.id,
        variantId: variant ? variant.id : IsNull(),
      },
    });

    const quantity = (existing?.quantity ?? 0) + input.quantity;
    if (variant && quantity > variant.stock) {
      throw new BadRequestException(
        `Үлдэгдэл хүрэлцэхгүй (${variant.size}: ${variant.stock} ширхэг)`,
      );
    }

    const unitPrice = Number(variant?.price ?? product.price);
    if (existing) {
      existing.quantity = quantity;
      existing.unitPrice = unitPrice;
      existing.amount = unitPrice * quantity;
      if (lookId) existing.lookId = lookId;
      await this.lineItemRepo.save(existing);
    } else {
      await this.lineItemRepo.save(
        this.lineItemRepo.create({
          orderId: basket.id,
          productId: product.id,
          variantId: variant?.id ?? null,
          name: product.name,
          productSlug: product.slug,
          imageUrl: product.mainImage,
          size: variant?.size ?? null,
          color: variant?.color || product.color,
          quantity,
          unitPrice,
          amount: unitPrice * quantity,
          lookId,
        }),
      );
    }
    return basket;
  }

  async updateCartItem(
    owner: CartOwner,
    input: UpdateCartItemInput,
  ): Promise<Order> {
    const { basket, lineItem } = await this.findLine(owner, input.lineItemId);
    if (lineItem.variantId) {
      const variant = await this.variantRepo.findOne({
        where: { id: lineItem.variantId },
      });
      if (variant && input.quantity > variant.stock) {
        throw new BadRequestException(
          `Үлдэгдэл хүрэлцэхгүй (${variant.stock} ширхэг)`,
        );
      }
    }
    lineItem.quantity = input.quantity;
    lineItem.amount = Number(lineItem.unitPrice) * input.quantity;
    await this.lineItemRepo.save(lineItem);
    return this.recalcAndLoad(basket.id);
  }

  async removeFromCart(owner: CartOwner, lineItemId: number): Promise<Order> {
    const { basket, lineItem } = await this.findLine(owner, lineItemId);
    await this.lineItemRepo.remove(lineItem);
    return this.recalcAndLoad(basket.id);
  }

  /** Нэвтэрсний дараа зочин сагсыг хэрэглэгчийн сагс руу нийлүүлнэ */
  async mergeGuestCart(
    userId: string,
    cartToken: string,
  ): Promise<Order | null> {
    const guest = await this.findBasket({ cartToken });
    if (!guest || !guest.lineItems?.length) return this.findBasket({ userId });

    const userBasket = await this.findBasket({ userId });
    if (!userBasket) {
      guest.userId = userId;
      await this.orderRepo.save(guest);
      return this.recalcAndLoad(guest.id);
    }
    for (const item of guest.lineItems) {
      const same = userBasket.lineItems.find(
        (li) =>
          li.productId === item.productId && li.variantId === item.variantId,
      );
      if (same) {
        same.quantity += item.quantity;
        same.amount = Number(same.unitPrice) * same.quantity;
        await this.lineItemRepo.save(same);
      } else {
        item.orderId = userBasket.id;
        await this.lineItemRepo.save(item);
      }
    }
    await this.orderRepo.delete(guest.id);
    return this.recalcAndLoad(userBasket.id);
  }

  // ── Checkout ───────────────────────────────────────
  /**
   * basket → pending. Үлдэгдлийг транзакц дотор шалгаж хасна
   * (хязгаарлагдмал тоотой дроп учраас давхар зарагдахаас сэргийлнэ).
   */
  async checkout(owner: CartOwner, input: CheckoutInput): Promise<Order> {
    const basket = await this.findBasket(owner);
    if (!basket) throw new BadRequestException('Сагс олдсонгүй');
    if (!basket.lineItems?.length) throw new BadRequestException('Сагс хоосон');

    await this.dataSource.transaction(async (em) => {
      for (const li of basket.lineItems) {
        if (!li.variantId) continue;
        const variant = await em.findOne(Variant, {
          where: { id: li.variantId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!variant || variant.stock < li.quantity) {
          throw new BadRequestException(
            `"${li.name}" (${li.size}) үлдэгдэл хүрэлцэхгүй байна`,
          );
        }
        variant.stock -= li.quantity;
        await em.save(variant);
      }

      const totals = await this.computeTotals(basket.lineItems);
      await em.update(Order, basket.id, {
        number: this.generateNumber('KU'),
        status: OrderStatus.PENDING,
        customerName: input.customerName,
        email: input.email.toLowerCase(),
        phone: input.phone,
        city: input.city,
        district: input.district,
        khoroo: input.khoroo ?? null,
        addressLine: input.addressLine,
        notes: input.notes ?? null,
        placedAt: new Date(),
        ...totals,
      });
    });

    return this.orderRepo.findOneOrFail({
      where: { id: basket.id },
      relations: RELATIONS,
    });
  }

  /** Цуцлагдсан захиалгын үлдэгдлийг буцаана */
  async restoreStock(orderId: number): Promise<void> {
    const items = await this.lineItemRepo.find({ where: { orderId } });
    for (const li of items) {
      if (li.variantId) {
        await this.variantRepo.increment(
          { id: li.variantId },
          'stock',
          li.quantity,
        );
      }
    }
  }

  // ── Туслах ─────────────────────────────────────────
  private async findLine(owner: CartOwner, lineItemId: number) {
    const basket = await this.findBasket(owner);
    if (!basket) throw new NotFoundException('Сагс олдсонгүй');
    const lineItem = basket.lineItems.find((li) => li.id === lineItemId);
    if (!lineItem) throw new NotFoundException('Сагсанд ийм бараа алга');
    return { basket, lineItem };
  }

  /**
   * Нийт дүн + лукийн багц хямдрал.
   * Лукийн бүх бараа (lookId-тай мөрүүд) сагсанд байвал бүрэн багц бүрт
   * (хамгийн бага тоогоор) хямдралын хувь хэрэглэнэ.
   */
  private async computeTotals(items: LineItem[]) {
    const itemTotal = items.reduce((s, li) => s + Number(li.amount), 0);

    let discountTotal = 0;
    const lookIds = [
      ...new Set(items.map((li) => li.lookId).filter((x): x is number => !!x)),
    ];
    if (lookIds.length) {
      const looks = await this.lookRepo.find({
        where: { id: In(lookIds) },
        relations: ['items'],
      });
      for (const look of looks) {
        const pct = Number(look.bundleDiscountPercent) || 0;
        if (pct <= 0 || !look.items.length) continue;
        const lines = items.filter((li) => li.lookId === look.id);
        const perProduct = look.items.map((it) => {
          const ls = lines.filter((li) => li.productId === it.productId);
          return {
            qty: ls.reduce((s, l) => s + l.quantity, 0),
            unit: ls.length
              ? Math.min(...ls.map((l) => Number(l.unitPrice)))
              : 0,
          };
        });
        const sets = Math.min(...perProduct.map((p) => p.qty));
        if (sets > 0) {
          const setPrice = perProduct.reduce((s, p) => s + p.unit, 0);
          discountTotal += Math.round((setPrice * sets * pct) / 100);
        }
      }
    }

    const net = itemTotal - discountTotal;
    const threshold = this.config.get<number>(
      'app.freeDeliveryThreshold',
      150000,
    );
    const fee = this.config.get<number>('app.deliveryFee', 6000);
    const deliveryFee = net <= 0 || net >= threshold ? 0 : fee;
    return { itemTotal, discountTotal, deliveryFee, total: net + deliveryFee };
  }

  private async recalcAndLoad(orderId: number): Promise<Order> {
    const items = await this.lineItemRepo.find({ where: { orderId } });
    await this.orderRepo.update(orderId, await this.computeTotals(items));
    return this.orderRepo.findOneOrFail({
      where: { id: orderId },
      relations: RELATIONS,
    });
  }

  private generateNumber(prefix: string): string {
    const rand = randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${Date.now().toString(36).toUpperCase()}${rand}`;
  }
}

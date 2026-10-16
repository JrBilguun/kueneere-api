import { Injectable, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Repository } from 'typeorm';
import {
  NestjsQueryTypeOrmModule,
  TypeOrmQueryService,
} from '@ptc-org/nestjs-query-typeorm';
import { CRUDResolver, PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';
import { SubscribeNewsletterInput } from './dto/subscribe.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { MarketingGuard, StaffGuard } from '../../common/guards/role.guard';
import { noopAuthorizers } from '../../common/auth/noop-authorizers';

@Injectable()
export class NewsletterService extends TypeOrmQueryService<NewsletterSubscriber> {
  constructor(
    @InjectRepository(NewsletterSubscriber)
    readonly repo: Repository<NewsletterSubscriber>,
  ) {
    super(repo);
  }

  /** Давхар бүртгүүлбэл алдаа өгөхгүй (idempotent) — имэйл байгаа эсэхийг задруулахгүй */
  async subscribe(input: SubscribeNewsletterInput): Promise<boolean> {
    const email = input.email.toLowerCase().trim();
    const existing = await this.repo.findOne({ where: { email } });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.unsubscribedAt = null;
        await this.repo.save(existing);
      }
      return true;
    }
    await this.repo.save(
      this.repo.create({
        email,
        locale: input.locale ?? 'mn',
        source: input.source ?? null,
      }),
    );
    return true;
  }

  async unsubscribe(email: string): Promise<boolean> {
    await this.repo.update(
      { email: email.toLowerCase().trim() },
      { isActive: false, unsubscribedAt: new Date() },
    );
    return true;
  }
}

@Resolver(() => NewsletterSubscriber)
export class NewsletterResolver extends CRUDResolver(NewsletterSubscriber, {
  enableTotalCount: true,
  pagingStrategy: PagingStrategies.OFFSET,
  read: { guards: [GqlAuthGuard, StaffGuard], maxResultsSize: 500 },
  create: { disabled: true },
  update: { disabled: true },
  delete: { guards: [GqlAuthGuard, MarketingGuard], many: { disabled: true } },
}) {
  constructor(readonly service: NewsletterService) {
    super(service);
  }

  @Mutation(() => Boolean, { description: 'Newsletter бүртгүүлэх (нийтийн)' })
  subscribeNewsletter(
    @Args('input') input: SubscribeNewsletterInput,
  ): Promise<boolean> {
    return this.service.subscribe(input);
  }

  @Mutation(() => Boolean, { description: 'Newsletter-ээс гарах' })
  unsubscribeNewsletter(@Args('email') email: string): Promise<boolean> {
    return this.service.unsubscribe(email);
  }
}

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsletterSubscriber]),
    NestjsQueryTypeOrmModule.forFeature([NewsletterSubscriber]),
  ],
  providers: [
    ...noopAuthorizers('NewsletterSubscriber'),
    NewsletterService,
    NewsletterResolver,
  ],
})
export class NewsletterModule {}

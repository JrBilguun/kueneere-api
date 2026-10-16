import {
  BadRequestException,
  Injectable,
  Module,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { Repository } from 'typeorm';
import { SiteContent } from './entities/site-content.entity';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Role } from '../../common/constants/roles';

export const CONTENT_KEYS = [
  'hero',
  'ticker',
  'campaign',
  'community',
  'newsletter',
] as const;
const MAX_BYTES = 50_000;

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(SiteContent)
    private readonly repo: Repository<SiteContent>,
  ) {}

  async all(): Promise<Record<string, unknown>> {
    const rows = await this.repo.find();
    return Object.fromEntries(rows.map((r) => [r.key, r.data]));
  }

  async update(key: string, data: unknown): Promise<Record<string, unknown>> {
    if (!(CONTENT_KEYS as readonly string[]).includes(key)) {
      throw new BadRequestException(`Тодорхойгүй хэсэг: ${key}`);
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('data нь object байх ёстой');
    }
    if (JSON.stringify(data).length > MAX_BYTES) {
      throw new BadRequestException('Контент хэт том байна');
    }
    await this.repo.save({ key, data: data as Record<string, unknown> });
    return this.all();
  }
}

@Resolver()
export class ContentResolver {
  constructor(private readonly content: ContentService) {}

  @Query(() => GraphQLJSON, {
    description:
      'Сайтын контент (hero, ticker, campaign, community, newsletter)',
  })
  siteContent(): Promise<Record<string, unknown>> {
    return this.content.all();
  }

  @UseGuards(GqlAuthGuard, RoleGuard(Role.MANAGER, Role.MARKETER))
  @Mutation(() => GraphQLJSON, { description: 'Нэг хэсгийн контент шинэчлэх' })
  updateSiteContent(
    @Args('key') key: string,
    @Args('data', { type: () => GraphQLJSON }) data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.content.update(key, data);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([SiteContent])],
  providers: [ContentService, ContentResolver],
  exports: [ContentService],
})
export class ContentModule {}

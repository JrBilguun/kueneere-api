import {
  Args,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Look } from './entities/look.entity';
import { LookService } from './look.service';
import { LookPricing, SaveLookInput } from './dto/look.inputs';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { RoleGuard, StaffGuard } from '../../common/guards/role.guard';
import { Role } from '../../common/constants/roles';

/** admin | manager | marketer */
const ContentWriteGuard = RoleGuard(Role.MANAGER, Role.MARKETER);

@Resolver(() => Look)
export class LookResolver {
  constructor(private readonly lookService: LookService) {}

  @Query(() => [Look], { description: 'Дэлгүүр: нийтлэгдсэн Shop the Look' })
  storeLooks(): Promise<Look[]> {
    return this.lookService.published();
  }

  @UseGuards(GqlAuthGuard, StaffGuard)
  @Query(() => [Look], { description: 'Admin: бүх лук' })
  looks(): Promise<Look[]> {
    return this.lookService.all();
  }

  @UseGuards(GqlAuthGuard, StaffGuard)
  @Query(() => Look)
  look(@Args('id', { type: () => ID }) id: number): Promise<Look> {
    return this.lookService.findOne(Number(id));
  }

  @ResolveField(() => LookPricing, {
    description: 'Бараануудын үнээс автоматаар',
  })
  pricing(@Parent() look: Look): LookPricing {
    return this.lookService.pricing(look);
  }

  @UseGuards(GqlAuthGuard, ContentWriteGuard)
  @Mutation(() => Look, { description: 'Лук үүсгэх / засах (цэгүүдтэй нь)' })
  saveLook(@Args('input') input: SaveLookInput): Promise<Look> {
    return this.lookService.save(input);
  }

  @UseGuards(GqlAuthGuard, ContentWriteGuard)
  @Mutation(() => Boolean)
  deleteLook(@Args('id', { type: () => ID }) id: number): Promise<boolean> {
    return this.lookService.remove(Number(id));
  }

  @UseGuards(GqlAuthGuard, ContentWriteGuard)
  @Mutation(() => [Look], { description: 'Дарааллыг солих' })
  reorderLooks(
    @Args('ids', { type: () => [Int] }) ids: number[],
  ): Promise<Look[]> {
    return this.lookService.reorder(ids);
  }
}

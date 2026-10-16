import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Campaign } from '../entities/campaign.entity';
import { CampaignAsset } from '../entities/campaign-asset.entity';
import { AudienceSegment } from '../entities/audience-segment.entity';
import { BudgetTransaction, ChannelBudget } from '../entities/budget.entities';

@Injectable()
export class CampaignService extends TypeOrmQueryService<Campaign> {
  constructor(@InjectRepository(Campaign) repo: Repository<Campaign>) {
    super(repo);
  }
}

@Injectable()
export class CampaignAssetService extends TypeOrmQueryService<CampaignAsset> {
  constructor(
    @InjectRepository(CampaignAsset) repo: Repository<CampaignAsset>,
  ) {
    super(repo);
  }
}

@Injectable()
export class AudienceSegmentService extends TypeOrmQueryService<AudienceSegment> {
  constructor(
    @InjectRepository(AudienceSegment) repo: Repository<AudienceSegment>,
  ) {
    super(repo);
  }
}

@Injectable()
export class ChannelBudgetService extends TypeOrmQueryService<ChannelBudget> {
  constructor(
    @InjectRepository(ChannelBudget) repo: Repository<ChannelBudget>,
  ) {
    super(repo);
  }
}

@Injectable()
export class BudgetTransactionService extends TypeOrmQueryService<BudgetTransaction> {
  constructor(
    @InjectRepository(BudgetTransaction) repo: Repository<BudgetTransaction>,
  ) {
    super(repo);
  }
}

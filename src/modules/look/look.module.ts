import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Look } from './entities/look.entity';
import { LookItem } from './entities/look-item.entity';
import { Product } from '../catalog/entities/product.entity';
import { LookService } from './look.service';
import { LookResolver } from './look.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Look, LookItem, Product])],
  providers: [LookService, LookResolver],
  exports: [LookService, TypeOrmModule],
})
export class LookModule {}

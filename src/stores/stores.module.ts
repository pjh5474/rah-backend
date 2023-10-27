import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import {
  CategoryResolver,
  CommissionResolver,
  StoresResolver,
} from './stores.resolver';
import { StoresService } from './stores.service';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './repositories/category.repository';
import { Commission } from './entities/commission.entity';
import { Post } from 'src/uploads/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Store, Category, Commission, Post])],
  providers: [
    StoresResolver,
    StoresService,
    CategoryRepository,
    CategoryResolver,
    CommissionResolver,
  ],
})
export class StoresModule {}

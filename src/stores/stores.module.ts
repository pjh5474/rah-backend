import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { StoresResolver } from './stores.resolver';
import { StoresService } from './stores.service';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Store, Category])],
  providers: [StoresResolver, StoresService],
})
export class StoresModule {}

import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commission } from 'src/stores/entities/commission.entity';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { Post } from './entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Commission, Post])],
  controllers: [UploadsController],
  providers: [PostsService, PostsResolver],
})
export class UploadsModule {}

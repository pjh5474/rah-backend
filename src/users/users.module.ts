import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/veritication.entity';
import { UsersResolver } from './users.resolver';
import { UserService } from './users.service';
import { ChatRoom } from 'src/chats/entities/chatroom.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification, ChatRoom])],
  providers: [UsersResolver, UserService],
  exports: [UserService],
})
export class UsersModule {}

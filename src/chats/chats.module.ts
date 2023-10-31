import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chatroom.entity';
import { ChatsService } from './chats.service';
import { ChatsResolver } from './chats.resolver';
import { Chat } from './entities/chat.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom, Chat, User])],
  providers: [ChatsService, ChatsResolver],
})
export class ChatsModule {}

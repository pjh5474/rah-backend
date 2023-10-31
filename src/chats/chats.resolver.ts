import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Chat } from './entities/chat.entity';
import { ChatsService } from './chats.service';
import {
  CreateChatRoomInput,
  CreateChatRoomOutput,
} from './dtos/create-chatroom.dto';
import { Role } from 'src/auth/role.decorator';
import { CreateChatInput, CreateChatOutput } from './dtos/create-chat.dto';
import { GetChatRoomsOutput } from './dtos/get-chatrooms.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { GetChatRoomInput, GetChatroomOutput } from './dtos/get-chatroom.dto';

@Resolver((of) => Chat)
export class ChatsResolver {
  constructor(private readonly chatsService: ChatsService) {}

  @Mutation((returns) => CreateChatRoomOutput)
  @Role(['Any'])
  createChatRoom(
    @Args('input') createChatRoomInput: CreateChatRoomInput,
  ): Promise<CreateChatRoomOutput> {
    return this.chatsService.createChatRoom(createChatRoomInput);
  }

  @Query((returns) => GetChatRoomsOutput)
  @Role(['Any'])
  getChatRooms(@AuthUser() authUser: User): Promise<GetChatRoomsOutput> {
    return this.chatsService.getChatRooms(authUser);
  }

  @Query((returns) => GetChatroomOutput)
  @Role(['Any'])
  getChatRoom(
    @AuthUser() authUser: User,
    @Args('input') getChatRoomInput: GetChatRoomInput,
  ): Promise<GetChatroomOutput> {
    return this.chatsService.getChatRoom(authUser, getChatRoomInput);
  }

  @Mutation((returns) => CreateChatOutput)
  @Role(['Any'])
  createChat(
    @AuthUser() authUser: User,
    @Args('input') createChatInput: CreateChatInput,
  ): Promise<CreateChatOutput> {
    return this.chatsService.createChat(authUser, createChatInput);
  }
}

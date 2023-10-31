import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chatroom.entity';
import { Repository } from 'typeorm';
import {
  CreateChatRoomInput,
  CreateChatRoomOutput,
} from './dtos/create-chatroom.dto';
import { Chat, ChatStatus } from './entities/chat.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { CreateChatInput, CreateChatOutput } from './dtos/create-chat.dto';
import { GetChatRoomsOutput } from './dtos/get-chatrooms.dto';
import { GetChatRoomInput, GetChatroomOutput } from './dtos/get-chatroom.dto';
import { LoadChatsInput, LoadChatsOutput } from './dtos/load-chats.dto';
import { PAGE_ITEMS } from 'src/common/common.constant';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRooms: Repository<ChatRoom>,

    @InjectRepository(Chat)
    private readonly chats: Repository<Chat>,

    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async createChatRoom({
    creatorId,
    clientId,
  }: CreateChatRoomInput): Promise<CreateChatRoomOutput> {
    try {
      const creator = await this.users.findOne({
        where: { id: creatorId },
      });

      if (!creator) {
        return { ok: false, error: 'Creator not found' };
      } else if (creator.role !== UserRole.Creator) {
        return { ok: false, error: 'Chatroom must have a creator' };
      }

      const client = await this.users.findOne({
        where: { id: clientId },
      });

      if (!client) {
        return { ok: false, error: 'Client not found' };
      } else if (client.role !== UserRole.Client) {
        return { ok: false, error: 'Chatroom must have a client' };
      }

      const newChatRoom = this.chatRooms.create({
        creator,
        client,
      });

      await this.chatRooms.save(newChatRoom);
      return { ok: true, chatRoomId: newChatRoom.id };
    } catch (e) {
      console.log(e);
      return { ok: false, error: 'Could not create chat room' };
    }
  }

  async getChatRooms(authUser: User): Promise<GetChatRoomsOutput> {
    try {
      const user = await this.users.findOne({
        where: { id: authUser.id },
      });

      if (!user) {
        return { ok: false, error: 'User not found' };
      }

      const chatRooms = await this.chatRooms.find({
        where: [
          {
            creator: {
              id: authUser.id,
            },
          },
          {
            client: {
              id: authUser.id,
            },
          },
        ],
        relations: ['creator', 'client'],
      });
      return { ok: true, chatRooms };
    } catch (e) {
      console.log(e);
      return { ok: false, error: 'Could not get chat rooms' };
    }
  }

  async getChatRoom(
    authUser: User,
    { id: chatroomId }: GetChatRoomInput,
  ): Promise<GetChatroomOutput> {
    try {
      const chatRoom = await this.chatRooms.findOne({
        where: { id: chatroomId },
        relations: ['creator', 'client', 'chats'],
      });

      if (!chatRoom) {
        return { ok: false, error: 'ChatRoom not found' };
      }

      if (
        chatRoom.creator.id !== authUser.id &&
        chatRoom.client.id !== authUser.id
      ) {
        return { ok: false, error: 'Not authorized' };
      }

      return { ok: true, chatRoom };
    } catch (e) {
      console.log(e);
      return { ok: false, error: 'Could not get chat room' };
    }
  }

  async createChat(
    authUser: User,
    { content, chatRoomId }: CreateChatInput,
  ): Promise<CreateChatOutput> {
    try {
      const user = await this.users.findOne({
        where: { id: authUser.id },
      });

      if (!user) {
        return { ok: false, error: 'User not found' };
      }

      const chatRoom = await this.chatRooms.findOne({
        where: { id: chatRoomId },
        relations: ['creator', 'client'],
      });

      if (!chatRoom) {
        return { ok: false, error: 'ChatRoom not found' };
      }

      if (
        chatRoom.creator.id !== authUser.id &&
        chatRoom.client.id !== authUser.id
      ) {
        return { ok: false, error: 'Not authorized' };
      }

      const isClient = user.role === UserRole.Client;

      const newChat = this.chats.create({
        content,
        chatRoom,
        sender: user,
        client_Message_status: !isClient
          ? ChatStatus.Sent
          : ChatStatus.Received,
        creator_Message_status: isClient
          ? ChatStatus.Sent
          : ChatStatus.Received,
      });

      await this.chats.save(newChat);

      return { ok: true };
    } catch (e) {
      console.log(e);
      return { ok: false, error: 'Could not create chat' };
    }
  }

  async loadChats(
    authUser: User,
    { chatRoomId, page }: LoadChatsInput,
  ): Promise<LoadChatsOutput> {
    try {
      const user = await this.users.findOne({
        where: { id: authUser.id },
      });

      if (!user) {
        return { ok: false, error: 'User not found' };
      }

      const chatRoom = await this.chatRooms.findOne({
        where: { id: chatRoomId },
        relations: ['creator', 'client'],
      });

      if (!chatRoom) {
        return { ok: false, error: 'ChatRoom not found' };
      }

      if (
        chatRoom.creator.id !== authUser.id &&
        chatRoom.client.id !== authUser.id
      ) {
        return { ok: false, error: 'Not authorized' };
      }

      const chats = await this.chats.find({
        where: {
          chatRoom: {
            id: chatRoomId,
          },
        },
        take: PAGE_ITEMS,
        order: {
          id: 'DESC',
        },
        skip: (page - 1) * PAGE_ITEMS,
      });

      return { ok: true, chats };
    } catch (e) {
      console.log(e);
      return { ok: false, error: 'Could not load chats' };
    }
  }
}

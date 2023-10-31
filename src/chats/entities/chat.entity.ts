import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { ChatRoom } from './chatroom.entity';

export enum ChatStatus {
  Sent = 'Sent',
  Received = 'Received',
  Read = 'Read',
}

registerEnumType(ChatStatus, { name: 'ChatStatus' });

@InputType('ChatInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Chat extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  content: string;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.chats, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  sender: User;

  @RelationId((chat: Chat) => chat.sender)
  sender_Id: number;

  @ManyToOne((type) => ChatRoom, (chatRoom) => chatRoom.chats, {
    onDelete: 'CASCADE',
  })
  chatRoom: ChatRoom;

  @RelationId((chat: Chat) => chat.chatRoom)
  chatRoom_Id: number;

  @Field((type) => ChatStatus)
  @Column({ type: 'enum', enum: ChatStatus })
  client_Message_status: ChatStatus;

  @Field((type) => ChatStatus)
  @Column({ type: 'enum', enum: ChatStatus })
  creator_Message_status: ChatStatus;
}

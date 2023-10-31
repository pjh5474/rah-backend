import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Chat } from './chat.entity';

@InputType('ChatRoomInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class ChatRoom extends CoreEntity {
  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.chatRooms, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  creator?: User;

  @RelationId((chatRoom: ChatRoom) => chatRoom.creator)
  creator_Id: number;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.chatRooms, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  client?: User;

  @RelationId((chatRoom: ChatRoom) => chatRoom.client)
  client_Id: number;

  @OneToMany((type) => Chat, (chat) => chat.chatRoom)
  @Field((type) => [Chat], { nullable: true })
  chats?: Chat[];

  @Field((type) => Number, { defaultValue: 0 })
  @Column({ default: 0 })
  unread_messages_user_1: number;

  @Field((type) => Number, { defaultValue: 0 })
  @Column({ default: 0 })
  unread_messages_user_2: number;
}

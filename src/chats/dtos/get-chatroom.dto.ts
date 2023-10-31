import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { ChatRoom } from '../entities/chatroom.entity';

@InputType()
export class GetChatRoomInput extends PickType(ChatRoom, ['id']) {}

@ObjectType()
export class GetChatroomOutput extends CoreOutput {
  @Field((type) => ChatRoom, { nullable: true })
  chatRoom?: ChatRoom;
}

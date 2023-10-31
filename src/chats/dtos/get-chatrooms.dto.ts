import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { ChatRoom } from '../entities/chatroom.entity';

@ObjectType()
export class GetChatRoomsOutput extends CoreOutput {
  @Field((type) => [ChatRoom], { nullable: true })
  chatRooms?: ChatRoom[];
}

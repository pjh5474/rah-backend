import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { ChatRoom } from '../entities/chatroom.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CreateChatRoomInput {
  @Field((type) => Int)
  creatorId: number;

  @Field((type) => Int)
  clientId: number;
}

@ObjectType()
export class CreateChatRoomOutput extends CoreOutput {
  @Field((type) => Int, { nullable: true })
  chatRoomId?: number;
}

import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Chat } from '../entities/chat.entity';

@InputType()
export class CreateChatInput extends PickType(Chat, ['content']) {
  @Field((type) => Int)
  chatRoomId: number;
}

@ObjectType()
export class CreateChatOutput extends CoreOutput {}

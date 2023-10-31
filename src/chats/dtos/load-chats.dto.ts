import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Chat } from '../entities/chat.entity';

@InputType()
export class LoadChatsInput extends PaginationInput {
  @Field((type) => Number)
  chatRoomId: number;
}

@ObjectType()
export class LoadChatsOutput extends PaginationOutput {
  @Field((type) => [Chat], { nullable: true })
  chats?: Chat[];
}

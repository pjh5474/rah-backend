import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class ReadChatInput {
  @Field((type) => Int)
  chatId: number;
}

@ObjectType()
export class ReadChatOutput extends CoreOutput {}

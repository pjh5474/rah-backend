import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Post } from '../entities/post.entity';

@InputType()
export class CreatePostInput extends PickType(Post, ['title', 'content']) {
  @Field((type) => Number)
  commissionId: number;
}

@ObjectType()
export class CreatePostOutput extends CoreOutput {}

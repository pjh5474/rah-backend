import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { Post } from '../entities/post.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class EditPostInput extends PickType(PartialType(Post), [
  'title',
  'content',
]) {
  @Field((type) => Number)
  postId: number;
}

@ObjectType()
export class EditPostOutput extends CoreOutput {}

import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Post } from '../entities/post.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class GetPostInput extends PickType(Post, ['id']) {}

@ObjectType()
export class GetPostOutput extends CoreOutput {
  @Field((type) => Post, { nullable: true })
  post?: Post;
}

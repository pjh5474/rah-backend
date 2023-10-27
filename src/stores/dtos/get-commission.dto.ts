import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Commission } from '../entities/commission.entity';
import { Post } from 'src/uploads/entities/post.entity';

@InputType()
export class GetCommissionInput extends PickType(Commission, ['id']) {}

@ObjectType()
export class GetCommissionOutput extends CoreOutput {
  @Field((type) => Commission, { nullable: true })
  commission?: Commission;

  @Field((type) => Post, { nullable: true })
  post?: Post;
}

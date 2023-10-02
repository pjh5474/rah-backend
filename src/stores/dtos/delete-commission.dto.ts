import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteCommissionInput {
  @Field((type) => Number)
  commissionId: number;
}

@ObjectType()
export class DeleteCommissionOutput extends CoreOutput {}

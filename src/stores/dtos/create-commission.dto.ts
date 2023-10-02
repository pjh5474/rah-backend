import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Commission } from '../entities/commission.entity';

@InputType()
export class CreateCommissionInput extends PickType(Commission, [
  'name',
  'price',
  'description',
  'options',
]) {
  @Field((type) => Number)
  storeId: number;
}

@ObjectType()
export class CreateCommissionOutput extends CoreOutput {}

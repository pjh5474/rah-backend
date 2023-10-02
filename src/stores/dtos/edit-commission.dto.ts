import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Commission } from '../entities/commission.entity';

@InputType()
export class EditCommissionInput extends PickType(PartialType(Commission), [
  'name',
  'price',
  'description',
  'options',
]) {
  @Field((type) => Number)
  commissionId: number;
}

@ObjectType()
export class EditCommissionOutput extends CoreOutput {}

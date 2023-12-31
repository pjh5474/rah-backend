import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Store } from '../entities/store.entity';

@InputType()
export class CreateStoreInput extends PickType(Store, [
  'name',
  'coverImg',
  'description',
]) {
  @Field((type) => String)
  categoryName: string;
}

@ObjectType()
export class CreateStoreOutput extends CoreOutput {
  @Field((type) => Int, { nullable: true })
  storeId?: number;
}

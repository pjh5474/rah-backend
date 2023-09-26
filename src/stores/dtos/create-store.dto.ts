import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Store } from '../entities/store.entity';

@InputType()
export class CreateStoreInput extends PickType(Store, ['name', 'coverImg']) {
  @Field((type) => String)
  categoryName: string;
}

@ObjectType()
export class CreateStoreOutput extends CoreOutput {}

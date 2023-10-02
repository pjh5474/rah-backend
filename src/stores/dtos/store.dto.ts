import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Store } from '../entities/store.entity';

@InputType()
export class StoreInput {
  @Field((type) => Number)
  storeId: number;
}

@ObjectType()
export class StoreOutput extends CoreOutput {
  @Field((type) => Store, { nullable: true })
  store?: Store;
}

import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Store } from './store.entity';

@InputType('CommissionChoiceInputType', { isAbstract: true })
@ObjectType()
class CommissionChoice {
  @Field((type) => String)
  name: string;

  @Field((type) => Number, { nullable: true })
  extra?: number;
}

@InputType('CommissionOptionInputType', { isAbstract: true })
@ObjectType()
class CommissionOption {
  @Field((type) => String)
  name: string;

  @Field((type) => [CommissionChoice], { nullable: true })
  choices?: CommissionChoice[];

  @Field((type) => Number, { nullable: true })
  extra?: number;
}

@InputType('CommissionInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Commission extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  name: string;

  @Field((type) => Number)
  @Column()
  @IsNumber()
  price: number;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo?: string;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  description?: string;

  @Field((type) => [CommissionOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: CommissionOption[];

  @Field((type) => Store)
  @ManyToOne((type) => Store, (store) => store.commissions, {
    onDelete: 'CASCADE',
  })
  store: Store;

  @RelationId((commission: Commission) => commission.store)
  storeId: number;
}

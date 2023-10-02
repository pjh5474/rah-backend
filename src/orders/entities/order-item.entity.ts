import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Commission } from 'src/stores/entities/commission.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field((type) => String)
  name: string;

  @Field((type) => String, { nullable: true })
  choice?: String;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @Field((type) => Commission)
  @ManyToOne((type) => Commission, { nullable: true, onDelete: 'CASCADE' })
  commission: Commission;

  @Field((type) => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}

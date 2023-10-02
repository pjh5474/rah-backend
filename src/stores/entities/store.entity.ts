import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Category } from './category.entity';
import { User } from 'src/users/entities/user.entity';
import { Commission } from './commission.entity';
import { Order } from 'src/orders/entities/order.entity';

@InputType('StoreInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Store extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => String)
  @Column()
  @IsString()
  coverImg: string;

  @ManyToOne((type) => Category, (category) => category.stores, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Field((type) => Category)
  category: Category;

  @ManyToOne((type) => User, (user) => user.stores, {
    onDelete: 'CASCADE',
  })
  @Field((type) => User)
  creator: User;

  @RelationId((store: Store) => store.creator)
  creatorId: number;

  @Field((type) => [Commission])
  @OneToMany((type) => Commission, (commission) => commission.store)
  commissions: Commission[];

  @OneToMany((type) => Order, (order) => order.store)
  @Field((type) => [Order])
  orders: Order[];
}

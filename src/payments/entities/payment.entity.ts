import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@InputType('PaymentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
  @Field((type) => String)
  @Column()
  transactionId: string;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.payments)
  user: User;

  @RelationId((payment: Payment) => payment.user)
  userId: number;

  @Field((type) => Order)
  @ManyToOne((type) => Order)
  order: Order;

  @Field((type) => Int)
  @RelationId((payment: Payment) => payment.order)
  orderId: number;

  @Field((type) => Float)
  @Column()
  price: number;
}

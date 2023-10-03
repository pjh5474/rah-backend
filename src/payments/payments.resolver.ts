import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { GetPaymentOutput } from './dtos/get-payments.dto';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payments.service';

@Resolver((of) => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation((returns) => CreatePaymentOutput)
  @Role(['Client'])
  createPayment(
    @AuthUser() client: User,
    @Args('input') createPaymentInput: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    return this.paymentService.createPayment(client, createPaymentInput);
  }

  @Query((returns) => GetPaymentOutput)
  @Role(['Any'])
  getPayments(@AuthUser() user: User): Promise<GetPaymentOutput> {
    return this.paymentService.getPayments(user);
  }
}

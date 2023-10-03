import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { Payment } from './entities/payment.entity';
import { PaymentResolver } from './payments.resolver';
import { PaymentService } from './payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order])],
  providers: [PaymentResolver, PaymentService],
})
export class PaymentsModule {}

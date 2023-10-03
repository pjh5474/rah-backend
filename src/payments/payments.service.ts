import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { GetPaymentOutput } from './dtos/get-payments.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
  ) {}

  async createPayment(
    client: User,
    { transactionId, orderId, price }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const order = await this.orders.findOne({
        where: {
          id: orderId,
        },
      });

      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }

      if (order.customerId !== client.id) {
        return {
          ok: false,
          error: "You are not allowed to pay for others' orders",
        };
      }

      // Check Price with Order Price
      if (order.total !== price) {
        return {
          ok: false,
          error: 'Price does not match',
        };
      }

      await this.payments.save(
        this.payments.create({
          transactionId,
          price,
          user: client,
          order,
        }),
      );

      order.isPaid = true;

      await this.orders.save(order);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create payment',
      };
    }
  }

  async getPayments(user: User): Promise<GetPaymentOutput> {
    try {
      const payments = await this.payments.find({
        where: {
          user: {
            id: user.id,
          },
        },
      });

      return {
        ok: true,
        payments,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not get payments',
      };
    }
  }
}

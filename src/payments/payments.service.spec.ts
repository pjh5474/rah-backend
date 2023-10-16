import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { SchedulerRegistry } from '@nestjs/schedule';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Order } from 'src/orders/entities/order.entity';

const Client = new User();
Client.id = 1;
Client.role = UserRole.Client;

const createPaymentArgs = {
  transactionId: '123',
  orderId: 1,
  price: 1,
};

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('PaymentsService', () => {
  let service: PaymentService;
  let paymentsRepository: MockRepository<Payment>;
  let ordersRepository: MockRepository<Order>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository(),
        },
        {
          provide: SchedulerRegistry,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    paymentsRepository = module.get(getRepositoryToken(Payment));
    ordersRepository = module.get(getRepositoryToken(Order));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    it('should fail if the store does not exist', async () => {
      ordersRepository.findOne.mockResolvedValue(undefined);

      const result = await service.createPayment(Client, createPaymentArgs);

      expect(result).toEqual({ ok: false, error: 'Order not found' });
    });

    it('should fail if the user is not the Client', async () => {
      ordersRepository.findOne.mockResolvedValue({
        customerId: 999,
      });

      const result = await service.createPayment(Client, createPaymentArgs);

      expect(result).toEqual({
        ok: false,
        error: "You are not allowed to pay for others' orders",
      });
    });

    it('should fail if the price does not match', async () => {
      ordersRepository.findOne.mockResolvedValue({
        customerId: 1,
        total: 1,
      });

      const result = await service.createPayment(Client, {
        ...createPaymentArgs,
        price: 999,
      });

      expect(result).toEqual({ ok: false, error: 'Price does not match' });
    });

    it('should create a new payment', async () => {
      ordersRepository.findOne.mockResolvedValue({
        customerId: 1,
        total: 1,
      });
      paymentsRepository.create.mockReturnValue({
        transactionId: '123',
      });
      paymentsRepository.save.mockResolvedValue({
        id: 1,
      });

      const result = await service.createPayment(Client, createPaymentArgs);

      expect(paymentsRepository.create).toHaveBeenCalledTimes(1);
      expect(paymentsRepository.create).toHaveBeenCalledWith({
        transactionId: '123',
        user: Client,
        order: {
          customerId: Client.id,
          total: 1,
          isPaid: true,
        },
        price: createPaymentArgs.price,
      });

      expect(paymentsRepository.save).toHaveBeenCalledTimes(1);
      expect(paymentsRepository.save).toHaveBeenCalledWith({
        transactionId: '123',
      });

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      ordersRepository.findOne.mockRejectedValue(new Error());

      const result = await service.createPayment(Client, createPaymentArgs);

      expect(result).toEqual({ ok: false, error: 'Could not create payment' });
    });
  });

  describe('getPayments', () => {
    it('should return all payments', async () => {
      paymentsRepository.find.mockResolvedValue([
        {
          id: 1,
        },
      ]);

      const result = await service.getPayments(Client);

      expect(result).toEqual({ ok: true, payments: [{ id: 1 }] });
    });

    it('should fail on exception', async () => {
      paymentsRepository.find.mockRejectedValue(new Error());

      const result = await service.getPayments(Client);

      expect(result).toEqual({ ok: false, error: 'Could not load payments' });
    });
  });
});

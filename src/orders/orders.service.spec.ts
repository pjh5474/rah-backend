import { Repository } from 'typeorm';
import { OrderService } from './orders.service';
import { Order, OrderStatus } from './entities/order.entity';
import { Store } from 'src/stores/entities/store.entity';
import { OrderItem } from './entities/order-item.entity';
import { Commission } from 'src/stores/entities/commission.entity';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';
import { CreateOrderInput } from './dtos/create-order.dto';
import { PUB_SUB } from 'src/common/common.constant';
import { GetOrdersInput } from './dtos/get-orders.dto';

const Customer = new User();
Customer.id = 1;
Customer.role = UserRole.Client;

const Creator = new User();
Creator.id = 2;
Creator.role = UserRole.Creator;

const commission = new Commission();
commission.id = 1;
commission.name = 'Commission-name';
commission.price = 10;
commission.options = [
  {
    name: 'option-name',
    extra: 1,
    choices: [
      {
        name: 'choice-name',
        extra: 1,
      },
    ],
  },
  {
    name: 'option-name_2',
    choices: [
      {
        name: 'choice-name_2-1',
        extra: 1,
      },
      {
        name: 'choice-name_2-2',
        extra: 2,
      },
    ],
  },
];

const createOrderArgs = new CreateOrderInput();
createOrderArgs.storeId = 1;
createOrderArgs.items = [
  {
    commissionId: 1,
    options: [
      {
        name: 'option-name',
        choice: 'choice-name',
      },
      {
        name: 'option-name_2',
        choice: 'choice-name_2-2',
      },
    ],
  },
];

const getOrdersArgs = new GetOrdersInput();
getOrdersArgs.status = OrderStatus.Pending;
getOrdersArgs.page = 1;

const editOrderArgs = {
  id: 1,
  status: OrderStatus.Drawing,
};

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
});

const mockPubSub = {
  publish: jest.fn(),
  subscribe: jest.fn(),
  asyncIterator: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

jest.mock('graphql-subscriptions', () => ({
  PubSub: jest.fn(() => mockPubSub),
}));

describe('OrdersService', () => {
  let service: OrderService;
  let ordersRepository: MockRepository<Order>;
  let storesRepository: MockRepository<Store>;
  let orderItemsRepository: MockRepository<OrderItem>;
  let commissionsRepository: MockRepository<Commission>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Store),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Commission),
          useValue: mockRepository(),
        },
        {
          provide: PUB_SUB,
          useValue: mockPubSub,
        },
      ],
    }).compile();
    service = module.get<OrderService>(OrderService);
    ordersRepository = module.get(getRepositoryToken(Order));
    storesRepository = module.get(getRepositoryToken(Store));
    orderItemsRepository = module.get(getRepositoryToken(OrderItem));
    commissionsRepository = module.get(getRepositoryToken(Commission));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should fail if store does not exist', async () => {
      storesRepository.findOne.mockResolvedValue(undefined);
      const result = await service.createOrder(Customer, createOrderArgs);
      expect(result).toEqual({ ok: false, error: 'Store not found' });
    });

    it('should fail if commission does not exist', async () => {
      storesRepository.findOne.mockResolvedValue(new Store());
      commissionsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.createOrder(Customer, createOrderArgs);
      expect(result).toEqual({ ok: false, error: 'Commission not found' });
    });

    it('should fail if commission option does not exist', async () => {
      storesRepository.findOne.mockResolvedValue(new Store());
      commissionsRepository.findOne.mockResolvedValue({
        options: [{ name: 'name_2', extra: 1 }],
      });
      const result = await service.createOrder(Customer, createOrderArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Commission option option-name not found',
      });
    });

    it('should fail if commission option choice does not exist', async () => {
      storesRepository.findOne.mockResolvedValue(new Store());
      commissionsRepository.findOne.mockResolvedValue({
        options: [
          {
            name: 'option-name',
            choices: [{ name: 'idot-choice', extra: 1 }],
          },
        ],
      });
      const result = await service.createOrder(Customer, createOrderArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Commission option choice choice-name not found',
      });
    });

    it('should create a new order', async () => {
      storesRepository.findOne.mockResolvedValue(new Store());
      commissionsRepository.findOne.mockResolvedValue(commission);
      orderItemsRepository.create.mockReturnValue({
        id: 1,
      });
      orderItemsRepository.save.mockResolvedValue({
        id: 1,
      });
      ordersRepository.create.mockReturnValue({
        id: 1,
      });
      ordersRepository.save.mockResolvedValue({
        id: 1,
      });

      const result = await service.createOrder(Customer, createOrderArgs);
      expect(result).toEqual({ ok: true });
      expect(ordersRepository.create).toHaveBeenCalledTimes(1);
      expect(ordersRepository.create).toHaveBeenCalledWith({
        customer: Customer,
        store: new Store(),
        items: [
          {
            id: 1,
          },
        ],
        total: 13,
      });
      expect(ordersRepository.save).toHaveBeenCalledTimes(1);
      expect(ordersRepository.save).toHaveBeenCalledWith({
        id: 1,
      });
      expect(orderItemsRepository.create).toHaveBeenCalledTimes(1);
      expect(orderItemsRepository.create).toHaveBeenCalledWith({
        commission: commission,
        options: [
          {
            name: 'option-name',
            choice: 'choice-name',
          },
          {
            name: 'option-name_2',
            choice: 'choice-name_2-2',
          },
        ],
      });
    });

    it('should fail on exception', async () => {
      storesRepository.findOne.mockRejectedValue(new Error(':)'));

      const result = await service.createOrder(Customer, createOrderArgs);
      expect(result).toEqual({ ok: false, error: 'Could not create order' });
    });
  });

  describe('getOrders', () => {
    it('should get orders when user is Client', async () => {
      ordersRepository.find.mockResolvedValue([
        {
          id: 1,
        },
      ]);
      const result = await service.getOrders(Customer, getOrdersArgs);
      expect(result).toEqual({ ok: true, orders: [{ id: 1 }] });
      expect(ordersRepository.find).toHaveBeenCalledTimes(1);
      expect(ordersRepository.find).toHaveBeenCalledWith({
        where: {
          customer: {
            id: Customer.id,
          },
          status: getOrdersArgs.status,
        },
        take: 25,
        skip: 0,
      });
    });

    it('should get orders when user is Creator', async () => {
      storesRepository.find.mockResolvedValue([
        {
          id: 1,
          orders: [
            {
              id: 1,
              status: getOrdersArgs.status,
            },
          ],
        },
      ]);

      const result = await service.getOrders(Creator, getOrdersArgs);
      expect(result).toEqual({
        ok: true,
        orders: [{ id: 1, status: getOrdersArgs.status }],
      });
      expect(storesRepository.find).toHaveBeenCalledTimes(1);
      expect(storesRepository.find).toHaveBeenCalledWith({
        where: {
          creator: {
            id: Creator.id,
          },
        },
        relations: ['orders'],
      });
    });

    it('should fail on exception', async () => {
      ordersRepository.find.mockRejectedValue(new Error(':)'));

      const result = await service.getOrders(Creator, getOrdersArgs);
      expect(result).toEqual({ ok: false, error: 'Could not get orders' });
    });
  });

  describe('getOrder', () => {
    it('should fail if order does not exist', async () => {
      ordersRepository.findOne.mockResolvedValue(undefined);

      const result = await service.getOrder(Creator, { id: 1 });
      expect(result).toEqual({ ok: false, error: 'Order not found' });
    });

    it('should fail if customer cannot see the order', async () => {
      ordersRepository.findOne.mockResolvedValue({
        id: 1,
        customerId: 999,
      });

      const result = await service.getOrder(Customer, { id: 1 });
      expect(result).toEqual({
        ok: false,
        error: "You can't see other peoples' orders",
      });
    });

    it('should fail if Creator cannot see the order', async () => {
      ordersRepository.findOne.mockResolvedValue({
        id: 1,
        store: {
          creatorId: 999,
        },
      });

      const result = await service.getOrder(Creator, { id: 1 });
      expect(result).toEqual({
        ok: false,
        error: "You can't see other peoples' orders",
      });
    });

    it('should return order', async () => {
      ordersRepository.findOne.mockResolvedValue({
        id: 1,
        store: {
          creatorId: Creator.id,
        },
      });

      const result = await service.getOrder(Creator, { id: 1 });
      expect(result).toEqual({
        ok: true,
        order: {
          id: 1,
          store: {
            creatorId: Creator.id,
          },
        },
      });
    });

    it('should fail on exception', async () => {
      ordersRepository.findOne.mockRejectedValue(new Error(':)'));

      const result = await service.getOrder(Creator, { id: 1 });
      expect(result).toEqual({ ok: false, error: 'Could not load order' });
    });
  });

  describe('editOrder', () => {
    it('should fail if order does not exist', async () => {
      ordersRepository.findOne.mockResolvedValue(undefined);

      const result = await service.editOrder(Creator, editOrderArgs);
      expect(result).toEqual({ ok: false, error: 'Order not found' });
    });

    it('should fail if user cannot see the order', async () => {
      ordersRepository.findOne.mockResolvedValue({
        id: 1,
        customerId: 999,
      });

      const result = await service.editOrder(Customer, editOrderArgs);
      expect(result).toEqual({
        ok: false,
        error: "You can't see other peoples' orders",
      });
    });

    it('should fail if user is customer', async () => {
      ordersRepository.findOne.mockResolvedValue({
        id: 1,
        customerId: Customer.id,
      });

      const result = await service.editOrder(Customer, editOrderArgs);
      expect(result).toEqual({
        ok: false,
        error: "Client can't edit order status to Drawing",
      });
    });

    it('should fail if user is Creator and status is not Drawing or Completed', async () => {
      ordersRepository.findOne.mockResolvedValue({
        id: 1,
        store: {
          creatorId: Creator.id,
        },
      });

      const result = await service.editOrder(Creator, {
        id: 1,
        status: OrderStatus.Pending,
      });
      expect(result).toEqual({
        ok: false,
        error: "Creator can't edit order status to Pending",
      });
    });

    it('should edit order', async () => {
      ordersRepository.findOne.mockResolvedValue({
        id: 1,
        store: {
          creatorId: Creator.id,
        },
      });

      const result = await service.editOrder(Creator, {
        id: 1,
        status: OrderStatus.Completed,
      });
      expect(result).toEqual({ ok: true });
      expect(ordersRepository.save).toHaveBeenCalledTimes(1);
      expect(ordersRepository.save).toHaveBeenCalledWith([
        {
          id: 1,
          status: OrderStatus.Completed,
        },
      ]);
    });

    it('should fail on exception', async () => {
      ordersRepository.findOne.mockRejectedValue(new Error(':)'));

      const result = await service.editOrder(Creator, editOrderArgs);
      expect(result).toEqual({ ok: false, error: 'Could not edit order' });
    });
  });
});

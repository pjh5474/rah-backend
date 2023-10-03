import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Commission } from 'src/stores/entities/commission.entity';
import { Store } from 'src/stores/entities/store.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Store)
    private readonly stores: Repository<Store>,
    @InjectRepository(Commission)
    private readonly commissions: Repository<Commission>,
  ) {}

  canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      canSee = false;
    }

    if (user.role === UserRole.Creator && order.store.creatorId !== user.id) {
      canSee = false;
    }
    return canSee;
  }

  async createOrder(
    customer: User,
    { storeId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const store = await this.stores.findOne({
        where: { id: storeId },
      });

      if (!store) {
        return { ok: false, error: 'Store not found' };
      }

      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const commission = await this.commissions.findOne({
          where: { id: item.commissionId },
        });
        if (!commission) {
          return {
            ok: false,
            error: 'Commission not found.',
          };
        }

        let commissionFinalPrice = commission.price;

        for (const itemOption of item.options) {
          const commissionOption = commission.options.find(
            (commissionOption) => commissionOption.name === itemOption.name,
          );

          if (!commissionOption) {
            return {
              ok: false,
              error: `Commission option ${itemOption.name} not found.`,
            };
          }

          if (commissionOption.extra) {
            commissionFinalPrice =
              commissionFinalPrice + commissionOption.extra;
          } else {
            const commissionOptionChoice = commissionOption.choices.find(
              (optionChoice) => optionChoice.name === itemOption.choice,
            );
            if (!commissionOptionChoice) {
              return {
                ok: false,
                error: `Commission option choice ${itemOption.choice} not found.`,
              };
            }

            if (commissionOptionChoice.extra) {
              commissionFinalPrice =
                commissionFinalPrice + commissionOptionChoice.extra;
            }
          }
        }
        orderFinalPrice = orderFinalPrice + commissionFinalPrice;
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            commission,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }

      await this.orders.save(
        this.orders.create({
          customer,
          store,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );

      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not create order' };
    }
  }

  async getOrders(
    user: User,
    { status, page }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: {
              id: user.id,
            },
            ...(status && { status }),
          },
          take: 25,
          skip: (page - 1) * 25,
        });
      } else if (user.role === UserRole.Creator) {
        const stores = await this.stores.find({
          where: {
            creator: {
              id: user.id,
            },
          },
          relations: ['orders'],
        });

        orders = stores.map((store) => store.orders).flat(1);

        if (status) {
          orders = orders.filter((order) => order.status === status);
        }

        orders = orders.slice((page - 1) * 25, page * 25);
      }

      return {
        ok: true,
        orders,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not get orders.',
      };
    }
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: { id: orderId },
        relations: ['store'],
      });

      if (!order) {
        return {
          ok: false,
          error: 'Order not found.',
        };
      }

      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: "You cant see other peoples' orders",
        };
      }

      return {
        ok: true,
        order,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load order',
      };
    }
  }

  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: { id: orderId },
        relations: ['store'],
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found.',
        };
      }

      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: "You cant see other peoples' orders",
        };
      }

      let canEdit = true;
      if (user.role === UserRole.Client) {
        if (status !== OrderStatus.Canceling) {
          canEdit = false;
        }
      }

      if (user.role === UserRole.Creator) {
        if (
          status !== OrderStatus.Rejected &&
          status !== OrderStatus.Accepted &&
          status !== OrderStatus.Drawing &&
          status !== OrderStatus.Completed &&
          status !== OrderStatus.Canceled
        ) {
          canEdit = false;
        }
      }

      if (!canEdit) {
        return {
          ok: false,
          error: `${user.role} can't edit order status to ${status}`,
        };
      }

      await this.orders.save([
        {
          id: orderId,
          status,
        },
      ]);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit order',
      };
    }
  }
}

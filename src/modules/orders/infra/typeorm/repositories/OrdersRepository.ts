import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import OrdersProducts from '@modules/orders/infra/typeorm/entities/OrdersProducts';
import Order from '../entities/Order';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  private ormRelationalRepository: Repository<OrdersProducts>;

  constructor() {
    this.ormRepository = getRepository(Order);
    this.ormRelationalRepository = getRepository(OrdersProducts);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const order = this.ormRepository.create({ customer });

    await this.ormRepository.save(order);

    products.forEach(product => {
      Object.assign(product, { order_id: order.id });
    });

    const order_products = this.ormRelationalRepository.create(products);

    await this.ormRelationalRepository.save(order_products);

    Object.assign(order, { order_products });
    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    const order = await this.ormRepository.findOne(
      { id },
      { relations: ['customer', 'order_products'] },
    );
    return order;
  }
}

export default OrdersRepository;

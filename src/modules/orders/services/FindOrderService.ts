import { inject, injectable } from 'tsyringe';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';
import AppError from '../../../shared/errors/AppError';

interface IRequest {
  id: string;
}

@injectable()
class FindOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ id }: IRequest): Promise<Order | undefined> {
    // TODO done
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new AppError('Order not found.');

    order.order_products = order.order_products.map(product => {
      Object.assign(product, { price: Number(product.price).toFixed(2) });
      return product;
    });

    return order;
  }
}

export default FindOrderService;

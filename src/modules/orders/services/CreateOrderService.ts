import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO done
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) throw new AppError('Customer not found');

    const productsFind = await this.productsRepository.findAllById(products);
    if (!products || (products && productsFind.length !== products.length))
      throw new AppError('Products invalid');

    const orderProduct = productsFind.map(item => {
      const productIndex = products.findIndex(
        product => product.id === item.id,
      );

      if (!products[productIndex].quantity)
        throw new AppError('Product quantity is required.');
      if (products[productIndex].quantity <= 0)
        throw new AppError('Product quantity need have min 1 quantity.');

      const quantity = item.quantity - products[productIndex].quantity;
      if (quantity < 0)
        throw new AppError('Product with quantity insufficient.');

      Object.assign(item, { quantity });

      return {
        product_id: item.id,
        price: item.price,
        quantity: products[productIndex].quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: orderProduct,
    });

    await this.productsRepository.updateQuantity(productsFind);

    order.order_products = order.order_products.map(product => {
      Object.assign(product, { price: Number(product.price).toFixed(2) });
      return product;
    });

    return order;
  }
}

export default CreateOrderService;

import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    // TODO done
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    Object.assign(product, { name, price, quantity });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    // TODO done
    const product = await this.ormRepository.findOne({ where: { name } });
    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    // TODO done
    const productsFind = await this.ormRepository.findByIds(products);

    return productsFind;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    // TODO done
    const productsFind = await this.ormRepository.findByIds(products);

    productsFind.map(product => {
      const productIndex = products.findIndex(find => find.id === product.id);
      Object.assign(product, { quantity: products[productIndex].quantity });
      return product;
    });

    await this.ormRepository.save(productsFind);
    return productsFind;
  }
}

export default ProductsRepository;

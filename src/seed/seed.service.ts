import { Injectable } from '@nestjs/common';

import { ProductsService } from 'src/products/products.service';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}

  async execute() {
    await this.insertAllProducts();
    return 'This action adds a new seed';
  }

  private async insertAllProducts() {
    await this.productsService.deleteAllProducts();
    return true;
  }
}

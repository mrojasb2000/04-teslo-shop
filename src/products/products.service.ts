import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  private defaultLimit: number;
  private defaultOffset: number;

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handlerDBExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto): Promise<Product[]> {
    const limit = paginationDto.limit ?? this.defaultLimit;
    const offset = paginationDto.offset ?? this.defaultOffset;

    return this.productRepository.find({
      skip: offset,
      take: limit,
    });
  }

  async findOne(term: string): Promise<Product> {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOne({
        where: { id: term },
      });
    }

    if (!product) {
      /* product = await this.productRepository.findOne({
        where: { slug: term },
      }); */
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('LOWER(title) like :title or LOWER(slug) =:slug', {
          title: `%${term.toLocaleLowerCase()}%`,
          slug: term.toLocaleLowerCase(),
        })
        .getOne();
    }

    if (!product) throw new NotFoundException(`Product '${term}' not found!`);

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.productRepository.delete({ id });
  }

  private handlerDBExceptions(error: any) {
    console.log(error);
    this.logger.error(`Error: ${error.code}, detail: ${error.detail}`);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}

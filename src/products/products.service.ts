import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { ProductImage, Product } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  private defaultLimit: number;
  private defaultOffset: number;

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((url) =>
          this.productImageRepository.create({ url }),
        ),
      });
      await this.productRepository.save(product);
      return { ...product, images };
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

  async update(id: string, updateProductDto: UpdateProductDto) {
    // Preload: find product by property (id) and load only properties in UpdateProductDto
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
      images: [],
    });

    if (!product) {
      throw new NotFoundException(`Product with id: #${id} not found.`);
    }

    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handlerDBExceptions(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.productRepository.delete({ id });
  }

  private handlerDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(`${error.detail}`);
    }
    console.log(error);
    throw new InternalServerErrorException(
      `Can't create Pokemon - Check server logs`,
    );
  }
}

import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPort,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { BeforeInsert } from 'typeorm';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  @IsString()
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @BeforeInsert()
  createSlugFromTitle() {
    if (!this.slug) {
      this.slug = this.title.toLocaleLowerCase();
    }
    this.slug = this.slug.trim().replaceAll(' ', '_').replaceAll("'", '');
  }
}

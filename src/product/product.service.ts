import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({ data: createProductDto });
  }

  findAll() {
    return this.prisma.product.findMany();
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
      },
    });

    if (!product)
      throw new NotFoundException('Product not found with the given ID');

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
      },
    });

    if (!product)
      throw new NotFoundException('Product not found with the given ID');

    return this.prisma.product.update({
      where: {
        id,
      },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
      },
    });

    if (!product)
      throw new NotFoundException('Product not found with the given ID');

    this.prisma.product.delete({
      where: {
        id,
      },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { utapi } from 'src/library/uploadthing';

import dayjs from 'dayjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        cart: {
          create: {},
        },
      },
    });
  }

  async upload(file: Express.Multer.File) {
    const resp = await utapi.uploadFiles(
      new File([file.buffer], `${file.originalname} ${dayjs()}`),
    );
    return resp;
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException('User not found with the given ID');

    const cartCount = await this.prisma.productsOnCart.aggregate({
      where: {
        cartId: user.cartId,
      },
      _sum: {
        quantity: true,
      },
    });

    const cartQuantity = cartCount._sum.quantity ?? 0;

    return { ...user, cartQuantity };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
    });
    if (!user) throw new NotFoundException('User not found with the given ID');

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
    });
    if (!user) throw new NotFoundException('User not found with the given ID');

    return this.prisma.user.delete({ where: { id } });
  }
}

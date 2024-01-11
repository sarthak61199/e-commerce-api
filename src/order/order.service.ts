import { Injectable, NotFoundException } from '@nestjs/common';
import { CompleteOrderDto, OrderDto } from './order.dto';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';
import { rzp } from 'src/library/razorpay';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: OrderDto, user: User) {
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        address: createOrderDto.address,
        city: createOrderDto.city,
        state: createOrderDto.state,
        pinCode: createOrderDto.pinCode,
      },
    });

    const products = await this.prisma.productsOnCart.findMany({
      where: {
        cartId: user.cartId,
      },
      select: {
        quantity: true,
        product: true,
      },
    });

    if (!products || !products.length)
      throw new NotFoundException('No products in cart for placing an order.');

    const totalAmount = products.reduce(
      (acc, item) => +item.product.price * item.quantity + acc,
      0,
    );

    const resp = await rzp.orders.create({
      amount: 100 * 100,
      currency: 'INR',
      receipt: 'receipt_order_74394',
      partial_payment: false,
    });

    return resp;
  }

  async completeOrder(completeOrderDto: CompleteOrderDto, user: User) {
    console.log(completeOrderDto);
    const products = await this.prisma.productsOnCart.findMany({
      where: {
        cartId: user.cartId,
      },
      select: {
        quantity: true,
        product: true,
      },
    });

    if (!products || !products.length)
      throw new NotFoundException('No products in cart for placing an order.');

    const totalAmount = products.reduce(
      (acc, item) => +item.product.price * item.quantity + acc,
      0,
    );

    const productsToId = products.map((item) => {
      return { productId: item.product.id, quantity: item.quantity };
    });

    const order = await this.prisma.order.create({
      data: {
        totalAmount,
        OrderOnProducts: {
          createMany: {
            data: productsToId,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    await this.prisma.productsOnCart.deleteMany({
      where: {
        cartId: user.cartId,
      },
    });

    return order;
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number, user: User) {
    return this.prisma.order.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        OrderOnProducts: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}

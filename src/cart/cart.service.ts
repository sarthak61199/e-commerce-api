import { Injectable } from '@nestjs/common';
import { CartDto } from './cart.dto';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getUserCart(user: User) {
    return this.prisma.user.findFirst({
      where: {
        id: user.id,
      },
      select: {
        cart: {
          select: {
            products: {
              select: {
                quantity: true,
                product: true,
              },
            },
          },
        },
      },
    });
  }

  async addToCart(addToCartDto: CartDto) {
    const result = await this.prisma.productsOnCart.findFirst({
      where: {
        cartId: addToCartDto.cartId,
        productId: addToCartDto.productId,
      },
    });

    if (!result) {
      return this.prisma.productsOnCart.create({
        data: {
          cartId: addToCartDto.cartId,
          productId: addToCartDto.productId,
        },
      });
    } else {
      return this.prisma.productsOnCart.update({
        where: {
          cartId_productId: {
            cartId: addToCartDto.cartId,
            productId: addToCartDto.productId,
          },
        },
        data: {
          quantity: {
            increment: 1,
          },
        },
      });
    }
  }

  async removeFromCart(removeCartDto: CartDto) {
    const result = await this.prisma.productsOnCart.findFirst({
      where: {
        cartId: removeCartDto.cartId,
        productId: removeCartDto.productId,
        quantity: {
          gt: 1,
        },
      },
    });

    if (result) {
      return this.prisma.productsOnCart.update({
        where: {
          cartId_productId: {
            cartId: removeCartDto.cartId,
            productId: removeCartDto.productId,
          },
        },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      });
    } else {
      return this.prisma.productsOnCart.delete({
        where: {
          cartId_productId: {
            cartId: removeCartDto.cartId,
            productId: removeCartDto.productId,
          },
        },
      });
    }
  }
}

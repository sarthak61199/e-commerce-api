import { Controller, Post, Body, Delete, Get, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartDto } from './cart.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getUserCart(@Request() req: any) {
    const user: User = req.user;
    return this.cartService.getUserCart(user);
  }

  @Post()
  addToCart(@Body() addToCartDto: CartDto) {
    return this.cartService.addToCart(addToCartDto);
  }

  @Delete()
  removeFromCart(@Body() addToCartDto: CartDto) {
    return this.cartService.removeFromCart(addToCartDto);
  }
}

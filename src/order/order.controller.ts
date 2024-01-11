import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { CompleteOrderDto, OrderDto } from './order.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: OrderDto, @Request() req: any) {
    const user: User = req.user;
    return this.orderService.create(createOrderDto, user);
  }

  @Post('complete-order')
  completeOrder(
    @Body() completeOrderDto: CompleteOrderDto,
    @Request() req: any,
  ) {
    const user: User = req.user;
    return this.orderService.completeOrder(completeOrderDto, user);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const user: User = req.user;
    return this.orderService.findOne(+id, user);
  }
}

import { IsNotEmpty, IsNumber } from 'class-validator';

export class CartDto {
  @IsNotEmpty()
  @IsNumber()
  cartId: number;

  @IsNotEmpty()
  @IsNumber()
  productId: number;
}

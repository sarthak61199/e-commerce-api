import { IsPhoneNumber, IsNotEmpty, IsString } from 'class-validator';

export class GenerateOtpDto {
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('IN')
  phoneNumber: string;
}

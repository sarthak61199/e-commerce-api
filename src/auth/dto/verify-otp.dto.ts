import {
  IsString,
  IsNotEmpty,
  Length,
  IsNumberString,
  IsPhoneNumber,
} from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @IsNumberString()
  otp: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('IN')
  phoneNumber: string;
}

import { Controller, Post, Body, HttpCode, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GenerateOtpDto } from './dto/generate-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

import { AuthService } from './auth.service';
import { Public } from './decorator/public-decorator';
import { Request, Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('generate-otp')
  @HttpCode(200)
  async generateOtp(@Body() generateOtpDto: GenerateOtpDto) {
    await this.authService.generateOtp(generateOtpDto);
    return {
      message:
        "OTP has been send to your mobile number. It's valid for only 15 mins.",
    };
  }

  @Public()
  @Post('verify-otp')
  verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.verifyOtp(verifyOtpDto, response);
  }

  @Public()
  @Post('refresh-token')
  refreshToken(@Req() request: Request) {
    return this.authService.refreshToken(request);
  }

  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }
}

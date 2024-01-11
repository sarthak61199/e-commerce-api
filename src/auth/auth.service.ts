import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import dayjs from 'dayjs';

import { GenerateOtpDto } from './dto/generate-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

import generateOtp from 'src/library/otp-generator';
import getTwilioClient from 'src/library/twilio';
import { PrismaService } from 'src/prisma.service';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private async sendMessage(otp: string, phoneNumber: string) {
    try {
      const twilioClient = getTwilioClient();
      await twilioClient.messages.create({
        body: `Your OTP is ${otp} and it is only valid for 15 mins.`,
        to: `+91${phoneNumber}`,
        from: '+17545818437',
      });
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async generateOtp(generateOtpDto: GenerateOtpDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        phoneNumber: generateOtpDto.phoneNumber,
      },
    });

    if (!user)
      throw new NotFoundException('User not found with the given Phone Number');

    const otp = generateOtp();
    const otpExpiryTime = dayjs().add(15, 'm').format();

    await this.prisma.user.update({
      where: {
        phoneNumber: generateOtpDto.phoneNumber,
      },
      data: {
        otpExpiryTime,
        otp,
      },
    });

    this.sendMessage(otp, generateOtpDto.phoneNumber);
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto, response: Response) {
    const user = await this.prisma.user.findFirst({
      where: {
        phoneNumber: verifyOtpDto.phoneNumber,
      },
    });

    if (!user)
      throw new NotFoundException('User not found with the given Phone Number');

    if (user.otp !== verifyOtpDto.otp)
      throw new BadRequestException('Invalid OTP.');

    const currentTime = dayjs();
    const otpExpiryTime = dayjs(user.otpExpiryTime);

    if (otpExpiryTime.diff(currentTime, 'm') < 0)
      throw new BadRequestException('OTP has expired.');

    const refreshToken = await this.jwtService.signAsync(user, {
      expiresIn: '7d',
    });

    response.cookie('refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    const accessToken = await this.jwtService.signAsync(user, {
      expiresIn: '7d',
    });

    return {
      accessToken,
    };
  }

  async refreshToken(request: Request) {
    const cookies = request.cookies;

    if (!cookies?.refreshToken) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(cookies?.refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.id,
        },
      });

      const accessToken = await this.jwtService.signAsync(user, {
        expiresIn: '1d',
      });

      return {
        accessToken,
      };
    } catch {
      throw new ForbiddenException();
    }
  }

  async logout(response: Response) {
    response.clearCookie('refreshToken');
  }
}

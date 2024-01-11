import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @Request() req: any) {
    const user: User = req.user;
    return this.reviewService.create(createReviewDto, user);
  }

  @Get(':id')
  reviewsOfProduct(@Param('id') id: string, @Request() req: any) {
    const user: User = req.user;
    return this.reviewService.reviewsOfProduct(+id, user);
  }

  @Get()
  reviewsOfUser(@Request() req: any) {
    const user: User = req.user;
    return this.reviewService.reviewsOfUser(user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req: any,
  ) {
    const user: User = req.user;

    return this.reviewService.update(+id, updateReviewDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const user: User = req.user;
    return this.reviewService.remove(+id, user);
  }
}

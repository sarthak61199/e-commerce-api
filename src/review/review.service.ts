import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  create(createReviewDto: CreateReviewDto, user: User) {
    return this.prisma.review.create({
      data: {
        productId: createReviewDto.productId,
        rating: createReviewDto.rating,
        description: createReviewDto.description,
        userId: user.id,
      },
    });
  }

  async reviewsOfProduct(productId: number, user: User) {
    const res = await this.prisma.product.findFirst({
      where: {
        id: productId,
      },
    });

    if (!res)
      throw new NotFoundException('Product not found with the given ID');

    const hasUserBoughtProduct = await this.prisma.order.findFirst({
      where: {
        userId: user.id,
        OrderOnProducts: {
          some: {
            productId,
          },
        },
      },
    });

    const reviews = await this.prisma.review.findMany({
      where: {
        productId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            imgUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const ratings = await this.prisma.review.groupBy({
      by: ['rating'],
      where: {
        productId,
      },
      _count: {
        rating: true,
      },
    });

    const totalRating = ratings.reduce((acc, item) => {
      return acc + item._count.rating * item.rating;
    }, 0);

    const totalReviews = await this.prisma.review.count({
      where: {
        productId,
      },
    });

    return {
      reviews,
      totalReviews,
      ratings: ratings.map((rating) => ({
        rating: rating.rating,
        count: rating._count.rating,
      })),
      productRating: Math.round(totalRating / totalReviews),
      hasUserBoughtProduct: Boolean(hasUserBoughtProduct),
    };
  }

  reviewsOfUser(user: User) {
    return this.prisma.review.findMany({
      where: {
        userId: user.id,
      },
    });
  }

  update(id: number, updateReviewDto: UpdateReviewDto, user: User) {
    return this.prisma.review.update({
      where: {
        id,
        userId: user.id,
      },
      data: updateReviewDto,
    });
  }

  remove(id: number, user: User) {
    return this.prisma.review.delete({
      where: {
        id,
        userId: user.id,
      },
    });
  }
}

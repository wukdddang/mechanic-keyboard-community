import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body(ValidationPipe) createReviewDto: CreateReviewDto,
    @Request() req,
  ) {
    try {
      console.log('🔄 리뷰 작성 요청:', {
        userId: req.user?.id,
        username: req.user?.username,
        reviewData: createReviewDto,
      });

      if (!req.user?.id) {
        console.error('❌ 사용자 ID가 없습니다:', req.user);
        throw new Error('사용자 인증 정보가 누락되었습니다.');
      }

      // Authorization 헤더에서 토큰 추출
      const authHeader = req.headers.authorization;
      const userToken = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : null;

      console.log('🔐 사용자 토큰 추출:', { hasToken: !!userToken });

      const result = await this.reviewsService.create(
        createReviewDto,
        req.user.id,
        userToken,
      );

      console.log('✅ 리뷰 작성 성공:', {
        reviewId: result?.id,
        userId: req.user.id,
      });

      return result;
    } catch (error) {
      console.error('❌ 리뷰 작성 실패:', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        reviewData: createReviewDto,
      });
      throw error;
    }
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.reviewsService.findAll(parseInt(page), parseInt(limit));
  }

  @Get('search')
  async search(
    @Query('keyboardFrame') keyboardFrame?: string,
    @Query('switchType') switchType?: string,
    @Query('keycapType') keycapType?: string,
    @Query('tags') tags?: string,
  ) {
    const tagsArray = tags ? tags.split(',') : undefined;
    return this.reviewsService.searchReviews({
      keyboardFrame,
      switchType,
      keycapType,
      tags: tagsArray,
    });
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.reviewsService.findByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }
}

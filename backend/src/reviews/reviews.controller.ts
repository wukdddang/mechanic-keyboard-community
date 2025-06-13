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
    return this.reviewsService.create(createReviewDto, req.user.id);
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

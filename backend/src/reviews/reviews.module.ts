import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from '../entities/review.entity';
import { ReviewMedia } from '../entities/review-media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewMedia])],
  providers: [ReviewsService],
  controllers: [ReviewsController],
})
export class ReviewsModule {}

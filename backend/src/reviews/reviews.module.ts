import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';

@Module({
  imports: [],
  providers: [ReviewsService],
  controllers: [ReviewsController],
})
export class ReviewsModule {}

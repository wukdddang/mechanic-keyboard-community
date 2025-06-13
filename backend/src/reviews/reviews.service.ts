import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { ReviewMedia } from '../entities/review-media.entity';
import { CreateReviewDto } from '../dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewMedia)
    private reviewMediaRepository: Repository<ReviewMedia>,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    userId: string,
  ): Promise<Review> {
    const review = this.reviewRepository.create({
      ...createReviewDto,
      userId,
    });

    return this.reviewRepository.save(review);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ reviews: Review[]; total: number }> {
    const [reviews, total] = await this.reviewRepository.findAndCount({
      relations: ['user', 'media'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { reviews, total };
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'media'],
    });

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    return review;
  }

  async findByUser(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { userId },
      relations: ['media'],
      order: { createdAt: 'DESC' },
    });
  }

  async searchReviews(query: {
    keyboardFrame?: string;
    switchType?: string;
    keycapType?: string;
    tags?: string[];
  }): Promise<Review[]> {
    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.media', 'media');

    if (query.keyboardFrame) {
      queryBuilder.andWhere('review.keyboardFrame LIKE :keyboardFrame', {
        keyboardFrame: `%${query.keyboardFrame}%`,
      });
    }

    if (query.switchType) {
      queryBuilder.andWhere('review.switchType LIKE :switchType', {
        switchType: `%${query.switchType}%`,
      });
    }

    if (query.keycapType) {
      queryBuilder.andWhere('review.keycapType LIKE :keycapType', {
        keycapType: `%${query.keycapType}%`,
      });
    }

    if (query.tags && query.tags.length > 0) {
      queryBuilder.andWhere('review.tags && :tags', { tags: query.tags });
    }

    return queryBuilder.orderBy('review.createdAt', 'DESC').getMany();
  }
}

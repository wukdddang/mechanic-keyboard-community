import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReviewsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createReviewDto: CreateReviewDto, userId: string): Promise<any> {
    const reviewData = {
      id: uuidv4(),
      ...createReviewDto,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabaseService.insert(
      'reviews',
      reviewData,
    );

    if (error) {
      throw new BadRequestException(`리뷰 생성 실패: ${error.message}`);
    }

    return data?.[0];
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ reviews: any[]; total: number }> {
    const offset = (page - 1) * limit;

    // 총 개수 가져오기
    const { data: countData, error: countError } = await this.supabaseService
      .getClient()
      .from('reviews')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new BadRequestException(
        `리뷰 개수 조회 실패: ${countError.message}`,
      );
    }

    // 리뷰 데이터 가져오기 (사용자 정보와 미디어 포함)
    const { data: reviews, error } = await this.supabaseService
      .getClient()
      .from('reviews')
      .select(
        `
        *,
        profiles!reviews_user_id_fkey (
          id,
          username,
          email
        ),
        review_media (
          id,
          file_url,
          file_type
        )
      `,
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new BadRequestException(`리뷰 조회 실패: ${error.message}`);
    }

    return {
      reviews: reviews || [],
      total: countData?.length || 0,
    };
  }

  async findOne(id: string): Promise<any> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('reviews')
      .select(
        `
        *,
        profiles!reviews_user_id_fkey (
          id,
          username,
          email
        ),
        review_media (
          id,
          file_url,
          file_type
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    return data;
  }

  async findByUser(userId: string): Promise<any[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('reviews')
      .select(
        `
        *,
        review_media (
          id,
          file_url,
          file_type
        )
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(`사용자 리뷰 조회 실패: ${error.message}`);
    }

    return data || [];
  }

  async searchReviews(query: {
    keyboardFrame?: string;
    switchType?: string;
    keycapType?: string;
    tags?: string[];
  }): Promise<any[]> {
    let supabaseQuery = this.supabaseService.getClient().from('reviews')
      .select(`
        *,
        profiles!reviews_user_id_fkey (
          id,
          username,
          email
        ),
        review_media (
          id,
          file_url,
          file_type
        )
      `);

    if (query.keyboardFrame) {
      supabaseQuery = supabaseQuery.ilike(
        'keyboard_frame',
        `%${query.keyboardFrame}%`,
      );
    }

    if (query.switchType) {
      supabaseQuery = supabaseQuery.ilike(
        'switch_type',
        `%${query.switchType}%`,
      );
    }

    if (query.keycapType) {
      supabaseQuery = supabaseQuery.ilike(
        'keycap_type',
        `%${query.keycapType}%`,
      );
    }

    if (query.tags && query.tags.length > 0) {
      supabaseQuery = supabaseQuery.overlaps('tags', query.tags);
    }

    const { data, error } = await supabaseQuery.order('created_at', {
      ascending: false,
    });

    if (error) {
      throw new BadRequestException(`리뷰 검색 실패: ${error.message}`);
    }

    return data || [];
  }

  async uploadReviewMedia(
    reviewId: string,
    files: Express.Multer.File[],
  ): Promise<any[]> {
    const mediaRecords: any[] = [];

    for (const file of files) {
      const fileName = `${reviewId}/${uuidv4()}-${file.originalname}`;

      // Supabase Storage에 파일 업로드
      const { data: uploadData, error: uploadError } =
        await this.supabaseService.uploadFile(
          'review-media',
          fileName,
          file.buffer,
          {
            contentType: file.mimetype,
          },
        );

      if (uploadError) {
        throw new BadRequestException(
          `파일 업로드 실패: ${uploadError.message}`,
        );
      }

      // 미디어 레코드 생성
      const mediaData = {
        id: uuidv4(),
        review_id: reviewId,
        file_url: await this.supabaseService.getPublicUrl(
          'review-media',
          fileName,
        ),
        file_type: file.mimetype,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabaseService.insert(
        'review_media',
        mediaData,
      );

      if (error) {
        throw new BadRequestException(
          `미디어 레코드 생성 실패: ${error.message}`,
        );
      }

      if (data && data[0]) {
        mediaRecords.push(data[0]);
      }
    }

    return mediaRecords;
  }

  async deleteReview(id: string, userId: string): Promise<void> {
    // 리뷰 소유자 확인
    const { data: review, error: findError } = await this.supabaseService
      .getClient()
      .from('reviews')
      .select('user_id')
      .eq('id', id)
      .single();

    if (findError || !review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    if (review.user_id !== userId) {
      throw new BadRequestException('리뷰를 삭제할 권한이 없습니다.');
    }

    // 관련 미디어 파일들 삭제
    const { data: mediaFiles } = await this.supabaseService
      .getClient()
      .from('review_media')
      .select('file_url')
      .eq('review_id', id);

    if (mediaFiles && mediaFiles.length > 0) {
      const filePaths = mediaFiles
        .map((media) => {
          const url = new URL(media.file_url);
          return url.pathname.split('/').pop();
        })
        .filter((path): path is string => path !== undefined);

      if (filePaths.length > 0) {
        await this.supabaseService.deleteFile('review-media', filePaths);
      }
    }

    // 리뷰 삭제 (CASCADE로 관련 미디어 레코드도 삭제됨)
    const { error } = await this.supabaseService.delete('reviews', id);

    if (error) {
      throw new BadRequestException(`리뷰 삭제 실패: ${error.message}`);
    }
  }
}

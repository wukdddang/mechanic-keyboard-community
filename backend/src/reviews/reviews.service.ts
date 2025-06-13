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

  async create(
    createReviewDto: CreateReviewDto,
    userId: string,
    userToken?: string,
  ): Promise<any> {
    try {
      console.log('🔄 ReviewsService.create 시작:', {
        userId,
        hasToken: !!userToken,
        createReviewDto,
      });

      // camelCase를 snake_case로 변환
      const reviewData = {
        id: uuidv4(),
        title: createReviewDto.title,
        content: createReviewDto.content,
        keyboard_frame: createReviewDto.keyboardFrame,
        switch_type: createReviewDto.switchType,
        keycap_type: createReviewDto.keycapType,
        desk_pad: createReviewDto.deskPad || null,
        desk_type: createReviewDto.deskType || null,
        sound_rating: createReviewDto.soundRating,
        feel_rating: createReviewDto.feelRating,
        overall_rating: createReviewDto.overallRating,
        tags: createReviewDto.tags || [],
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('📝 변환된 리뷰 데이터:', reviewData);

      let data, error;

      if (userToken) {
        // 사용자 토큰을 사용하여 인증된 컨텍스트에서 insert
        console.log('🔐 사용자 토큰으로 인증된 insert 사용');
        ({ data, error } = await this.supabaseService.insertWithAuth(
          'reviews',
          reviewData,
          userToken,
        ));
      } else {
        // 일반 insert (RLS 정책에 걸릴 수 있음)
        console.log('⚠️ 일반 insert 사용 (RLS 정책 위험)');
        ({ data, error } = await this.supabaseService.insert(
          'reviews',
          reviewData,
        ));
      }

      if (error) {
        console.error('❌ Supabase insert 에러:', {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw new BadRequestException(`리뷰 생성 실패: ${error.message}`);
      }

      console.log('✅ 리뷰 생성 성공:', data?.[0]);
      return data?.[0];
    } catch (error) {
      console.error('❌ ReviewsService.create 실패:', {
        error: error.message,
        stack: error.stack,
        userId,
        createReviewDto,
      });
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ reviews: any[]; total: number }> {
    try {
      console.log('🔄 리뷰 목록 조회 시작:', { page, limit });

      const offset = (page - 1) * limit;

      // 총 개수 가져오기
      const { data: countData, error: countError } = await this.supabaseService
        .getClient()
        .from('reviews')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('❌ 리뷰 개수 조회 실패:', countError);
        throw new BadRequestException(
          `리뷰 개수 조회 실패: ${countError.message}`,
        );
      }

      // 리뷰 데이터 가져오기 (관계 쿼리 제거하고 기본 테스트)
      const { data: reviews, error } = await this.supabaseService
        .getClient()
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ 리뷰 조회 실패:', error);
        throw new BadRequestException(`리뷰 조회 실패: ${error.message}`);
      }

      console.log('📊 조회된 리뷰 데이터:', {
        count: reviews?.length || 0,
        total: countData?.length || 0,
        sampleData: reviews?.[0]
          ? JSON.stringify(reviews[0], null, 2)
          : 'No data',
      });

      // 데이터 정제 (null 값들을 안전하게 처리)
      const cleanedReviews = (reviews || []).map((review) => ({
        id: review.id || '',
        title: review.title || '',
        content: review.content || '',
        keyboard_frame: review.keyboard_frame || '',
        switch_type: review.switch_type || '',
        keycap_type: review.keycap_type || '',
        desk_pad: review.desk_pad || null,
        desk_type: review.desk_type || null,
        sound_rating: review.sound_rating || 0,
        feel_rating: review.feel_rating || 0,
        overall_rating: review.overall_rating || 0,
        tags: review.tags || [],
        user_id: review.user_id || '',
        created_at: review.created_at || new Date().toISOString(),
        updated_at: review.updated_at || new Date().toISOString(),
      }));

      console.log('✅ 정제된 리뷰 데이터:', {
        count: cleanedReviews.length,
        sampleCleaned: cleanedReviews[0]
          ? JSON.stringify(cleanedReviews[0], null, 2)
          : 'No data',
      });

      return {
        reviews: cleanedReviews,
        total: countData?.length || 0,
      };
    } catch (error) {
      console.error('❌ findAll 실패:', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async findOne(id: string): Promise<any> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('reviews')
      .select('*')
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
      .select('*')
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
    let supabaseQuery = this.supabaseService
      .getClient()
      .from('reviews')
      .select('*');

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

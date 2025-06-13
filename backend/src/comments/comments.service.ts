import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCommentDto, UpdateCommentDto } from '../dto/create-comment.dto';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(
    createCommentDto: CreateCommentDto,
    userToken: string,
  ): Promise<Comment> {
    console.log('💬 댓글 생성 시작:', createCommentDto);

    try {
      // 사용자 정보 가져오기
      const { data: userData, error: userError } = await this.supabaseService
        .getClient()
        .auth.getUser(userToken);

      if (userError || !userData.user) {
        throw new ForbiddenException('유효하지 않은 사용자입니다.');
      }

      const userId = userData.user.id;

      // 리뷰 존재 확인
      const { data: reviewData, error: reviewError } =
        await this.supabaseService
          .getClient()
          .from('reviews')
          .select('id')
          .eq('id', createCommentDto.reviewId)
          .single();

      if (reviewError || !reviewData) {
        throw new NotFoundException('리뷰를 찾을 수 없습니다.');
      }

      // 댓글 생성
      const commentData = {
        review_id: createCommentDto.reviewId,
        user_id: userId,
        content: createCommentDto.content,
      };

      const { data, error } = await this.supabaseService
        .getClient()
        .from('comments')
        .insert(commentData)
        .select()
        .single();

      if (error) {
        console.error('❌ 댓글 생성 실패:', error);
        throw new Error(`댓글 생성에 실패했습니다: ${error.message}`);
      }

      console.log('✅ 댓글 생성 성공:', data);
      return new Comment(data);
    } catch (error) {
      console.error('❌ 댓글 생성 중 오류:', error);
      throw error;
    }
  }

  async findByReviewId(reviewId: string): Promise<Comment[]> {
    console.log('📋 리뷰 댓글 조회 시작:', reviewId);

    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('comments')
        .select(
          `
          *,
          profiles:user_id (
            id,
            username,
            email
          )
        `,
        )
        .eq('review_id', reviewId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ 댓글 조회 실패:', error);
        throw new Error(`댓글 조회에 실패했습니다: ${error.message}`);
      }

      console.log('✅ 댓글 조회 성공:', data?.length || 0, '개');

      return (data || []).map((comment) => {
        const commentData = {
          ...comment,
          user: comment.profiles
            ? {
                id: comment.profiles.id,
                username: comment.profiles.username,
                email: comment.profiles.email,
              }
            : null,
        };
        return new Comment(commentData);
      });
    } catch (error) {
      console.error('❌ 댓글 조회 중 오류:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userToken: string,
  ): Promise<Comment> {
    console.log('✏️ 댓글 수정 시작:', id, updateCommentDto);

    try {
      // 사용자 정보 가져오기
      const { data: userData, error: userError } = await this.supabaseService
        .getClient()
        .auth.getUser(userToken);

      if (userError || !userData.user) {
        throw new ForbiddenException('유효하지 않은 사용자입니다.');
      }

      const userId = userData.user.id;

      // 댓글 존재 및 소유권 확인
      const { data: existingComment, error: findError } =
        await this.supabaseService
          .getClient()
          .from('comments')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

      if (findError || !existingComment) {
        throw new NotFoundException(
          '댓글을 찾을 수 없거나 수정 권한이 없습니다.',
        );
      }

      // 댓글 수정
      const { data, error } = await this.supabaseService
        .getClient()
        .from('comments')
        .update({ content: updateCommentDto.content })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ 댓글 수정 실패:', error);
        throw new Error(`댓글 수정에 실패했습니다: ${error.message}`);
      }

      console.log('✅ 댓글 수정 성공:', data);
      return new Comment(data);
    } catch (error) {
      console.error('❌ 댓글 수정 중 오류:', error);
      throw error;
    }
  }

  async remove(id: string, userToken: string): Promise<void> {
    console.log('🗑️ 댓글 삭제 시작:', id);

    try {
      // 사용자 정보 가져오기
      const { data: userData, error: userError } = await this.supabaseService
        .getClient()
        .auth.getUser(userToken);

      if (userError || !userData.user) {
        throw new ForbiddenException('유효하지 않은 사용자입니다.');
      }

      const userId = userData.user.id;

      // 댓글 존재 및 소유권 확인
      const { data: existingComment, error: findError } =
        await this.supabaseService
          .getClient()
          .from('comments')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

      if (findError || !existingComment) {
        throw new NotFoundException(
          '댓글을 찾을 수 없거나 삭제 권한이 없습니다.',
        );
      }

      // 댓글 삭제
      const { error } = await this.supabaseService
        .getClient()
        .from('comments')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ 댓글 삭제 실패:', error);
        throw new Error(`댓글 삭제에 실패했습니다: ${error.message}`);
      }

      console.log('✅ 댓글 삭제 성공');
    } catch (error) {
      console.error('❌ 댓글 삭제 중 오류:', error);
      throw error;
    }
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from '../dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Headers('authorization') authorization: string,
  ) {
    try {
      if (!authorization) {
        throw new HttpException(
          '인증 토큰이 필요합니다.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const token = authorization.replace('Bearer ', '');
      const comment = await this.commentsService.create(
        createCommentDto,
        token,
      );

      return {
        success: true,
        data: comment.toResponse(),
        message: '댓글이 성공적으로 작성되었습니다.',
      };
    } catch (error) {
      console.error('댓글 생성 실패:', error);
      throw new HttpException(
        error.message || '댓글 작성에 실패했습니다.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('review/:reviewId')
  async findByReviewId(@Param('reviewId') reviewId: string) {
    try {
      const comments = await this.commentsService.findByReviewId(reviewId);

      return {
        success: true,
        data: comments.map((comment) => comment.toResponse()),
        total: comments.length,
      };
    } catch (error) {
      console.error('댓글 조회 실패:', error);
      throw new HttpException(
        error.message || '댓글 조회에 실패했습니다.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Headers('authorization') authorization: string,
  ) {
    try {
      if (!authorization) {
        throw new HttpException(
          '인증 토큰이 필요합니다.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const token = authorization.replace('Bearer ', '');
      const comment = await this.commentsService.update(
        id,
        updateCommentDto,
        token,
      );

      return {
        success: true,
        data: comment.toResponse(),
        message: '댓글이 성공적으로 수정되었습니다.',
      };
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      throw new HttpException(
        error.message || '댓글 수정에 실패했습니다.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    try {
      if (!authorization) {
        throw new HttpException(
          '인증 토큰이 필요합니다.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const token = authorization.replace('Bearer ', '');
      await this.commentsService.remove(id, token);

      return {
        success: true,
        message: '댓글이 성공적으로 삭제되었습니다.',
      };
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      throw new HttpException(
        error.message || '댓글 삭제에 실패했습니다.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

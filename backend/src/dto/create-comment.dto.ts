import { IsString, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  reviewId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: '댓글은 1000자를 초과할 수 없습니다.' })
  content: string;
}

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: '댓글은 1000자를 초과할 수 없습니다.' })
  content: string;
}

import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  Max,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  keyboardFrame: string;

  @IsNotEmpty()
  @IsString()
  switchType: string;

  @IsNotEmpty()
  @IsString()
  keycapType: string;

  @IsOptional()
  @IsString()
  deskPad?: string;

  @IsOptional()
  @IsString()
  deskType?: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  soundRating: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  feelRating: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  overallRating: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

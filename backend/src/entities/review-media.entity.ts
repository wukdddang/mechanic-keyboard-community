import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Review } from './review.entity';

export enum MediaType {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
}

@Entity('review_media')
export class ReviewMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column({
    type: 'enum',
    enum: MediaType,
    default: MediaType.IMAGE,
  })
  type: MediaType;

  @Column()
  url: string;

  @ManyToOne(() => Review, (review) => review.media)
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @Column()
  reviewId: string;

  @CreateDateColumn()
  createdAt: Date;
}

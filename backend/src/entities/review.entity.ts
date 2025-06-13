import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { ReviewMedia } from './review-media.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  // 키보드 정보
  @Column()
  keyboardFrame: string;

  @Column()
  switchType: string;

  @Column()
  keycapType: string;

  @Column({ nullable: true })
  deskPad: string;

  @Column({ nullable: true })
  deskType: string;

  // 평점
  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  soundRating: number;

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  feelRating: number;

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  overallRating: number;

  // 태그
  @Column('simple-array', { nullable: true })
  tags: string[];

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => ReviewMedia, (media) => media.review)
  media: ReviewMedia[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

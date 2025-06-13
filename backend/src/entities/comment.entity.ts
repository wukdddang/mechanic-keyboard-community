export class Comment {
  id: string;
  reviewId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;

  // 관계 필드 (선택적)
  user?: {
    id: string;
    username: string;
    email: string;
  };

  constructor(data: any) {
    this.id = data.id;
    this.reviewId = data.review_id || data.reviewId;
    this.userId = data.user_id || data.userId;
    this.content = data.content;
    this.createdAt = new Date(data.created_at || data.createdAt);
    this.updatedAt = new Date(data.updated_at || data.updatedAt);

    // 사용자 정보가 있으면 포함
    if (data.user) {
      this.user = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
      };
    }
  }

  // 데이터베이스 저장용 변환
  toDatabase() {
    return {
      id: this.id,
      review_id: this.reviewId,
      user_id: this.userId,
      content: this.content,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }

  // API 응답용 변환
  toResponse() {
    return {
      id: this.id,
      reviewId: this.reviewId,
      userId: this.userId,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      user: this.user,
    };
  }
}

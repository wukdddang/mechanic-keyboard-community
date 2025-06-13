import 'user.dart';

class Comment {
  final String id;
  final String reviewId;
  final String userId;
  final String content;
  final DateTime createdAt;
  final DateTime updatedAt;
  final User? user;

  Comment({
    required this.id,
    required this.reviewId,
    required this.userId,
    required this.content,
    required this.createdAt,
    required this.updatedAt,
    this.user,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    try {
      return Comment(
        id: json['id'] ?? '',
        reviewId: json['reviewId'] ?? json['review_id'] ?? '',
        userId: json['userId'] ?? json['user_id'] ?? '',
        content: json['content'] ?? '',
        createdAt: _parseDateTime(json['createdAt'] ?? json['created_at']),
        updatedAt: _parseDateTime(json['updatedAt'] ?? json['updated_at']),
        user: json['user'] != null ? User.fromJson(json['user']) : null,
      );
    } catch (e) {
      print('❌ Comment 파싱 에러: $e');
      print('📄 원본 데이터: $json');
      rethrow;
    }
  }

  static DateTime _parseDateTime(dynamic value) {
    if (value == null) return DateTime.now();
    if (value is DateTime) return value;
    if (value is String) {
      try {
        return DateTime.parse(value);
      } catch (e) {
        print('❌ DateTime 파싱 실패: $value');
        return DateTime.now();
      }
    }
    return DateTime.now();
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'reviewId': reviewId,
      'userId': userId,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'user': user?.toJson(),
    };
  }

  Comment copyWith({
    String? id,
    String? reviewId,
    String? userId,
    String? content,
    DateTime? createdAt,
    DateTime? updatedAt,
    User? user,
  }) {
    return Comment(
      id: id ?? this.id,
      reviewId: reviewId ?? this.reviewId,
      userId: userId ?? this.userId,
      content: content ?? this.content,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      user: user ?? this.user,
    );
  }
} 
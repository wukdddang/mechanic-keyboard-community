import 'user.dart';

class Review {
  final String id;
  final String title;
  final String content;
  final String keyboardFrame;
  final String switchType;
  final String keycapType;
  final String? deskPad;
  final String? deskType;
  final double soundRating;
  final double feelRating;
  final double overallRating;
  final List<String> tags;
  final String userId;
  final User? user;
  final List<ReviewMedia> media;
  final DateTime createdAt;
  final DateTime updatedAt;

  Review({
    required this.id,
    required this.title,
    required this.content,
    required this.keyboardFrame,
    required this.switchType,
    required this.keycapType,
    this.deskPad,
    this.deskType,
    required this.soundRating,
    required this.feelRating,
    required this.overallRating,
    required this.tags,
    required this.userId,
    this.user,
    required this.media,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    try {
      return Review(
        id: json['id']?.toString() ?? '',
        title: json['title']?.toString() ?? '',
        content: json['content']?.toString() ?? '',
        keyboardFrame: json['keyboard_frame']?.toString() ?? json['keyboardFrame']?.toString() ?? '',
        switchType: json['switch_type']?.toString() ?? json['switchType']?.toString() ?? '',
        keycapType: json['keycap_type']?.toString() ?? json['keycapType']?.toString() ?? '',
        deskPad: json['desk_pad']?.toString() ?? json['deskPad']?.toString(),
        deskType: json['desk_type']?.toString() ?? json['deskType']?.toString(),
        soundRating: _parseDouble(json['sound_rating'] ?? json['soundRating']),
        feelRating: _parseDouble(json['feel_rating'] ?? json['feelRating']),
        overallRating: _parseDouble(json['overall_rating'] ?? json['overallRating']),
        tags: _parseStringList(json['tags']),
        userId: json['user_id']?.toString() ?? json['userId']?.toString() ?? '',
        user: json['user'] != null ? User.fromJson(json['user']) : null,
        media: _parseMediaList(json['media']),
        createdAt: _parseDateTime(json['created_at'] ?? json['createdAt']),
        updatedAt: _parseDateTime(json['updated_at'] ?? json['updatedAt']),
      );
    } catch (e) {
      print('Review.fromJson 에러: $e');
      print('원본 JSON: $json');
      rethrow;
    }
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  static List<String> _parseStringList(dynamic value) {
    if (value == null) return [];
    if (value is List) {
      return value.map((e) => e?.toString() ?? '').toList();
    }
    return [];
  }

  static List<ReviewMedia> _parseMediaList(dynamic value) {
    if (value == null) return [];
    if (value is List) {
      return value
          .map((m) {
            try {
              return ReviewMedia.fromJson(m);
            } catch (e) {
              print('ReviewMedia 파싱 에러: $e');
              return null;
            }
          })
          .whereType<ReviewMedia>()
          .toList();
    }
    return [];
  }

  static DateTime _parseDateTime(dynamic value) {
    if (value == null) return DateTime.now();
    if (value is String) {
      try {
        return DateTime.parse(value);
      } catch (e) {
        print('DateTime 파싱 에러: $e, value: $value');
        return DateTime.now();
      }
    }
    return DateTime.now();
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'keyboardFrame': keyboardFrame,
      'switchType': switchType,
      'keycapType': keycapType,
      'deskPad': deskPad,
      'deskType': deskType,
      'soundRating': soundRating,
      'feelRating': feelRating,
      'overallRating': overallRating,
      'tags': tags,
      'userId': userId,
      'user': user?.toJson(),
      'media': media.map((m) => m.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class ReviewMedia {
  final String id;
  final String filename;
  final String originalName;
  final String mimeType;
  final int size;
  final String type;
  final String url;
  final DateTime createdAt;

  ReviewMedia({
    required this.id,
    required this.filename,
    required this.originalName,
    required this.mimeType,
    required this.size,
    required this.type,
    required this.url,
    required this.createdAt,
  });

  factory ReviewMedia.fromJson(Map<String, dynamic> json) {
    return ReviewMedia(
      id: json['id'],
      filename: json['filename'],
      originalName: json['originalName'],
      mimeType: json['mimeType'],
      size: json['size'],
      type: json['type'],
      url: json['url'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'filename': filename,
      'originalName': originalName,
      'mimeType': mimeType,
      'size': size,
      'type': type,
      'url': url,
      'createdAt': createdAt.toIso8601String(),
    };
  }
} 
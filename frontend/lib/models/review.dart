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
  final User user;
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
    required this.user,
    required this.media,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'],
      title: json['title'],
      content: json['content'],
      keyboardFrame: json['keyboardFrame'],
      switchType: json['switchType'],
      keycapType: json['keycapType'],
      deskPad: json['deskPad'],
      deskType: json['deskType'],
      soundRating: (json['soundRating'] as num).toDouble(),
      feelRating: (json['feelRating'] as num).toDouble(),
      overallRating: (json['overallRating'] as num).toDouble(),
      tags: List<String>.from(json['tags'] ?? []),
      user: User.fromJson(json['user']),
      media: (json['media'] as List?)
          ?.map((m) => ReviewMedia.fromJson(m))
          .toList() ?? [],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
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
      'user': user.toJson(),
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
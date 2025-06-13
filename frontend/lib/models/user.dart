class User {
  final String id;
  final String username;
  final String email;
  final String? profileImage;
  final bool isVerified;
  final DateTime createdAt;

  User({
    required this.id,
    required this.username,
    required this.email,
    this.profileImage,
    required this.isVerified,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      email: json['email'],
      profileImage: json['profileImage'],
      isVerified: json['isVerified'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'profileImage': profileImage,
      'isVerified': isVerified,
      'createdAt': createdAt.toIso8601String(),
    };
  }
} 
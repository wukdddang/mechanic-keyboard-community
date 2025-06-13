import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user.dart';
import '../models/review.dart';
import '../models/comment.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:4000'; // Android 에뮬레이터용
  
  static String? _token;
  
  static void setToken(String token) {
    _token = token;
  }
  
  static void clearToken() {
    _token = null;
  }
  
  static Map<String, String> get _headers {
    final headers = {
      'Content-Type': 'application/json',
    };
    
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    
    return headers;
  }

  // 인증 관련
  static Future<Map<String, dynamic>> register({
    required String username,
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: _headers,
      body: jsonEncode({
        'username': username,
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('회원가입에 실패했습니다: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: _headers,
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('로그인에 실패했습니다: ${response.body}');
    }
  }

  static Future<void> logout() async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/logout'),
      headers: _headers,
    );

    if (response.statusCode == 201) {
      clearToken();
    } else {
      throw Exception('로그아웃에 실패했습니다: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getCurrentUser() async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('사용자 정보를 불러오는데 실패했습니다: ${response.body}');
    }
  }

  // 리뷰 관련
  static Future<List<Review>> getReviews({int page = 1, int limit = 10}) async {
    try {
      print('🔄 리뷰 목록 요청: page=$page, limit=$limit');
      
      final response = await http.get(
        Uri.parse('$baseUrl/reviews?page=$page&limit=$limit'),
        headers: _headers,
      );

      print('📡 응답 상태코드: ${response.statusCode}');
      print('📡 응답 본문: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('📊 파싱된 데이터: $data');
        
        if (data['reviews'] == null) {
          print('⚠️ reviews 필드가 null입니다');
          return [];
        }
        
        final List<dynamic> reviewsJson = data['reviews'];
        print('📋 리뷰 개수: ${reviewsJson.length}');
        
        if (reviewsJson.isNotEmpty) {
          print('📄 첫 번째 리뷰 샘플: ${reviewsJson[0]}');
        }
        
        final reviews = <Review>[];
        for (int i = 0; i < reviewsJson.length; i++) {
          try {
            final review = Review.fromJson(reviewsJson[i]);
            reviews.add(review);
            print('✅ 리뷰 ${i + 1} 파싱 성공');
          } catch (e) {
            print('❌ 리뷰 ${i + 1} 파싱 실패: $e');
            print('❌ 문제있는 데이터: ${reviewsJson[i]}');
            // 에러가 발생해도 계속 진행
          }
        }
        
        print('✅ 총 ${reviews.length}개 리뷰 파싱 완료');
        return reviews;
      } else {
        throw Exception('리뷰 목록을 불러오는데 실패했습니다: ${response.body}');
      }
    } catch (e) {
      print('❌ getReviews 에러: $e');
      rethrow;
    }
  }

  static Future<Review> getReview(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/reviews/$id'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return Review.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('리뷰를 불러오는데 실패했습니다: ${response.body}');
    }
  }

  static Future<Review> createReview({
    required String title,
    required String content,
    required String keyboardFrame,
    required String switchType,
    required String keycapType,
    String? deskPad,
    String? deskType,
    required double soundRating,
    required double feelRating,
    required double overallRating,
    List<String>? tags,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/reviews'),
      headers: _headers,
      body: jsonEncode({
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
      }),
    );

    if (response.statusCode == 201) {
      return Review.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('리뷰 작성에 실패했습니다: ${response.body}');
    }
  }

  static Future<List<Review>> searchReviews({
    String? keyboardFrame,
    String? switchType,
    String? keycapType,
    List<String>? tags,
  }) async {
    final queryParams = <String, String>{};
    
    if (keyboardFrame != null) queryParams['keyboardFrame'] = keyboardFrame;
    if (switchType != null) queryParams['switchType'] = switchType;
    if (keycapType != null) queryParams['keycapType'] = keycapType;
    if (tags != null && tags.isNotEmpty) queryParams['tags'] = tags.join(',');

    final uri = Uri.parse('$baseUrl/reviews/search').replace(
      queryParameters: queryParams.isEmpty ? null : queryParams,
    );

    final response = await http.get(uri, headers: _headers);

    if (response.statusCode == 200) {
      final List<dynamic> reviewsJson = jsonDecode(response.body);
      return reviewsJson.map((json) => Review.fromJson(json)).toList();
    } else {
      throw Exception('리뷰 검색에 실패했습니다: ${response.body}');
    }
  }

  // 댓글 관련
  static Future<List<Comment>> getComments(String reviewId) async {
    try {
      print('💬 댓글 목록 요청: reviewId=$reviewId');
      
      final response = await http.get(
        Uri.parse('$baseUrl/comments/review/$reviewId'),
        headers: _headers,
      );

      print('📡 댓글 응답 상태코드: ${response.statusCode}');
      print('📡 댓글 응답 본문: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('📊 댓글 파싱된 데이터: $data');
        
        if (data['data'] == null) {
          print('⚠️ 댓글 data 필드가 null입니다');
          return [];
        }
        
        final List<dynamic> commentsJson = data['data'];
        print('📋 댓글 개수: ${commentsJson.length}');
        
        final comments = <Comment>[];
        for (int i = 0; i < commentsJson.length; i++) {
          try {
            final comment = Comment.fromJson(commentsJson[i]);
            comments.add(comment);
            print('✅ 댓글 ${i + 1} 파싱 성공');
          } catch (e) {
            print('❌ 댓글 ${i + 1} 파싱 실패: $e');
            print('❌ 문제있는 댓글 데이터: ${commentsJson[i]}');
          }
        }
        
        print('✅ 총 ${comments.length}개 댓글 파싱 완료');
        return comments;
      } else {
        throw Exception('댓글 목록을 불러오는데 실패했습니다: ${response.body}');
      }
    } catch (e) {
      print('❌ getComments 에러: $e');
      rethrow;
    }
  }

  static Future<Comment> createComment({
    required String reviewId,
    required String content,
  }) async {
    try {
      print('💬 댓글 작성 요청: reviewId=$reviewId, content=$content');
      
      final response = await http.post(
        Uri.parse('$baseUrl/comments'),
        headers: _headers,
        body: jsonEncode({
          'reviewId': reviewId,
          'content': content,
        }),
      );

      print('📡 댓글 작성 응답 상태코드: ${response.statusCode}');
      print('📡 댓글 작성 응답 본문: ${response.body}');

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return Comment.fromJson(data['data']);
      } else {
        throw Exception('댓글 작성에 실패했습니다: ${response.body}');
      }
    } catch (e) {
      print('❌ createComment 에러: $e');
      rethrow;
    }
  }

  static Future<Comment> updateComment({
    required String commentId,
    required String content,
  }) async {
    try {
      print('✏️ 댓글 수정 요청: commentId=$commentId, content=$content');
      
      final response = await http.patch(
        Uri.parse('$baseUrl/comments/$commentId'),
        headers: _headers,
        body: jsonEncode({
          'content': content,
        }),
      );

      print('📡 댓글 수정 응답 상태코드: ${response.statusCode}');
      print('📡 댓글 수정 응답 본문: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Comment.fromJson(data['data']);
      } else {
        throw Exception('댓글 수정에 실패했습니다: ${response.body}');
      }
    } catch (e) {
      print('❌ updateComment 에러: $e');
      rethrow;
    }
  }

  static Future<void> deleteComment(String commentId) async {
    try {
      print('🗑️ 댓글 삭제 요청: commentId=$commentId');
      
      final response = await http.delete(
        Uri.parse('$baseUrl/comments/$commentId'),
        headers: _headers,
      );

      print('📡 댓글 삭제 응답 상태코드: ${response.statusCode}');
      print('📡 댓글 삭제 응답 본문: ${response.body}');

      if (response.statusCode != 200) {
        throw Exception('댓글 삭제에 실패했습니다: ${response.body}');
      }
      
      print('✅ 댓글 삭제 성공');
    } catch (e) {
      print('❌ deleteComment 에러: $e');
      rethrow;
    }
  }
} 
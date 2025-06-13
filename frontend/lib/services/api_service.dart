import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user.dart';
import '../models/review.dart';

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
    final response = await http.get(
      Uri.parse('$baseUrl/reviews?page=$page&limit=$limit'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> reviewsJson = data['reviews'];
      return reviewsJson.map((json) => Review.fromJson(json)).toList();
    } else {
      throw Exception('리뷰 목록을 불러오는데 실패했습니다: ${response.body}');
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
} 
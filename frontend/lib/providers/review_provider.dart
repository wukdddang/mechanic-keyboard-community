import 'package:flutter/foundation.dart';
import '../models/review.dart';
import '../services/api_service.dart';

class ReviewProvider with ChangeNotifier {
  List<Review> _reviews = [];
  bool _isLoading = false;
  String? _error;

  List<Review> get reviews => _reviews;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadReviews({int page = 1, int limit = 10}) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final reviews = await ApiService.getReviews(page: page, limit: limit);
      
      if (page == 1) {
        _reviews = reviews;
      } else {
        _reviews.addAll(reviews);
      }

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      debugPrint('리뷰 로드 실패: $e');
    }
  }

  Future<Review?> getReview(String id) async {
    try {
      return await ApiService.getReview(id);
    } catch (e) {
      debugPrint('리뷰 상세 조회 실패: $e');
      return null;
    }
  }

  Future<bool> createReview({
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
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final review = await ApiService.createReview(
        title: title,
        content: content,
        keyboardFrame: keyboardFrame,
        switchType: switchType,
        keycapType: keycapType,
        deskPad: deskPad,
        deskType: deskType,
        soundRating: soundRating,
        feelRating: feelRating,
        overallRating: overallRating,
        tags: tags,
      );

      _reviews.insert(0, review);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      debugPrint('리뷰 작성 실패: $e');
      return false;
    }
  }

  Future<List<Review>> searchReviews({
    String? keyboardFrame,
    String? switchType,
    String? keycapType,
    List<String>? tags,
  }) async {
    try {
      return await ApiService.searchReviews(
        keyboardFrame: keyboardFrame,
        switchType: switchType,
        keycapType: keycapType,
        tags: tags,
      );
    } catch (e) {
      debugPrint('리뷰 검색 실패: $e');
      return [];
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
} 
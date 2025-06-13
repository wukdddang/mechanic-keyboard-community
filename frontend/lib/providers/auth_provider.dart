import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  String? _token;
  bool _isLoading = false;

  User? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null && _token != null;

  AuthProvider() {
    _loadUserFromStorage();
  }

  Future<void> _loadUserFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final userJson = prefs.getString('user');

      if (token != null && userJson != null) {
        _token = token;
        _user = User.fromJson(Map<String, dynamic>.from(
          Map.from(userJson as Map)
        ));
        ApiService.setToken(token);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('사용자 정보 로드 실패: $e');
    }
  }

  Future<void> _saveUserToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (_token != null && _user != null) {
        await prefs.setString('token', _token!);
        await prefs.setString('user', _user!.toJson().toString());
      }
    } catch (e) {
      debugPrint('사용자 정보 저장 실패: $e');
    }
  }

  Future<void> _clearUserFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('token');
      await prefs.remove('user');
    } catch (e) {
      debugPrint('사용자 정보 삭제 실패: $e');
    }
  }

  Future<bool> login(String username, String password) async {
    try {
      _isLoading = true;
      notifyListeners();

      final response = await ApiService.login(
        username: username,
        password: password,
      );

      _token = response['token'];
      _user = User.fromJson(response['user']);
      
      ApiService.setToken(_token!);
      await _saveUserToStorage();

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      debugPrint('로그인 실패: $e');
      return false;
    }
  }

  Future<bool> register(String username, String email, String password) async {
    try {
      _isLoading = true;
      notifyListeners();

      final response = await ApiService.register(
        username: username,
        email: email,
        password: password,
      );

      _token = response['token'];
      _user = User.fromJson(response['user']);
      
      ApiService.setToken(_token!);
      await _saveUserToStorage();

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      debugPrint('회원가입 실패: $e');
      return false;
    }
  }

  Future<void> logout() async {
    _user = null;
    _token = null;
    ApiService.clearToken();
    await _clearUserFromStorage();
    notifyListeners();
  }
} 
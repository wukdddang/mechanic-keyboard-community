import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ApiTestScreen extends StatefulWidget {
  const ApiTestScreen({super.key});

  @override
  State<ApiTestScreen> createState() => _ApiTestScreenState();
}

class _ApiTestScreenState extends State<ApiTestScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _usernameController = TextEditingController();
  String _testResult = '';
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _usernameController.dispose();
    super.dispose();
  }

  void _showResult(String result) {
    setState(() {
      _testResult = result;
      _isLoading = false;
    });
  }

  void _showLoading() {
    setState(() {
      _isLoading = true;
      _testResult = '';
    });
  }

  Future<void> _testRegister() async {
    if (_emailController.text.isEmpty ||
        _passwordController.text.isEmpty ||
        _usernameController.text.isEmpty) {
      _showResult('❌ 모든 필드를 입력해주세요.');
      return;
    }

    _showLoading();
    try {
      final result = await ApiService.register(
        username: _usernameController.text,
        email: _emailController.text,
        password: _passwordController.text,
      );
      _showResult('✅ 회원가입 성공!\n결과: ${result.toString()}');
    } catch (e) {
      _showResult('❌ 회원가입 실패: $e');
    }
  }

  Future<void> _testLogin() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      _showResult('❌ 이메일과 비밀번호를 입력해주세요.');
      return;
    }

    _showLoading();
    try {
      final result = await ApiService.login(
        email: _emailController.text,
        password: _passwordController.text,
      );
      _showResult('✅ 로그인 성공!\n결과: ${result.toString()}');
      
      // 로그인 성공시 토큰 저장
      if (result['session'] != null && result['session']['access_token'] != null) {
        ApiService.setToken(result['session']['access_token']);
      }
    } catch (e) {
      _showResult('❌ 로그인 실패: $e');
    }
  }

  Future<void> _testLogout() async {
    _showLoading();
    try {
      await ApiService.logout();
      _showResult('✅ 로그아웃 성공!');
    } catch (e) {
      _showResult('❌ 로그아웃 실패: $e');
    }
  }

  Future<void> _testGetCurrentUser() async {
    _showLoading();
    try {
      final result = await ApiService.getCurrentUser();
      _showResult('✅ 현재 사용자 정보 조회 성공!\n결과: ${result.toString()}');
    } catch (e) {
      _showResult('❌ 사용자 정보 조회 실패: $e');
    }
  }

  Future<void> _testGetReviews() async {
    _showLoading();
    try {
      final reviews = await ApiService.getReviews();
      _showResult('✅ 리뷰 목록 조회 성공!\n개수: ${reviews.length}개');
    } catch (e) {
      _showResult('❌ 리뷰 목록 조회 실패: $e');
    }
  }

  Future<void> _testCreateReview() async {
    _showLoading();
    try {
      final review = await ApiService.createReview(
        title: '테스트 리뷰',
        content: '이것은 API 테스트용 리뷰입니다.',
        keyboardFrame: '테스트 키보드',
        switchType: '테스트 스위치',
        keycapType: '테스트 키캡',
        soundRating: 4.5,
        feelRating: 4.0,
        overallRating: 4.2,
        tags: ['테스트', 'API'],
      );
      _showResult('✅ 리뷰 생성 성공!\n제목: ${review.title}');
    } catch (e) {
      _showResult('❌ 리뷰 생성 실패: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('API 테스트'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 입력 필드들
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '테스트 데이터 입력',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _usernameController,
                      decoration: const InputDecoration(
                        labelText: '사용자명',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _emailController,
                      decoration: const InputDecoration(
                        labelText: '이메일',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _passwordController,
                      decoration: const InputDecoration(
                        labelText: '비밀번호',
                        border: OutlineInputBorder(),
                      ),
                      obscureText: true,
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // 테스트 버튼들
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'API 테스트',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        ElevatedButton(
                          onPressed: _isLoading ? null : _testRegister,
                          child: const Text('회원가입 테스트'),
                        ),
                        ElevatedButton(
                          onPressed: _isLoading ? null : _testLogin,
                          child: const Text('로그인 테스트'),
                        ),
                        ElevatedButton(
                          onPressed: _isLoading ? null : _testLogout,
                          child: const Text('로그아웃 테스트'),
                        ),
                        ElevatedButton(
                          onPressed: _isLoading ? null : _testGetCurrentUser,
                          child: const Text('사용자 정보 조회'),
                        ),
                        ElevatedButton(
                          onPressed: _isLoading ? null : _testGetReviews,
                          child: const Text('리뷰 목록 조회'),
                        ),
                        ElevatedButton(
                          onPressed: _isLoading ? null : _testCreateReview,
                          child: const Text('리뷰 생성 테스트'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // 결과 표시
            Expanded(
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '테스트 결과',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Expanded(
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.grey[300]!),
                          ),
                          child: _isLoading
                              ? const Center(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      CircularProgressIndicator(),
                                      SizedBox(height: 8),
                                      Text('테스트 중...'),
                                    ],
                                  ),
                                )
                              : SingleChildScrollView(
                                  child: Text(
                                    _testResult.isEmpty 
                                        ? '테스트 버튼을 눌러서 API 연동을 확인해보세요.' 
                                        : _testResult,
                                    style: const TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: 14,
                                    ),
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
} 
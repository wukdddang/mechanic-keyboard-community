import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import '../providers/review_provider.dart';

class CreateReviewScreen extends StatefulWidget {
  const CreateReviewScreen({super.key});

  @override
  State<CreateReviewScreen> createState() => _CreateReviewScreenState();
}

class _CreateReviewScreenState extends State<CreateReviewScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  final _keyboardFrameController = TextEditingController();
  final _switchTypeController = TextEditingController();
  final _keycapTypeController = TextEditingController();
  final _deskPadController = TextEditingController();
  final _deskTypeController = TextEditingController();
  final _tagsController = TextEditingController();

  double _soundRating = 0;
  double _feelRating = 0;
  double _overallRating = 0;

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    _keyboardFrameController.dispose();
    _switchTypeController.dispose();
    _keycapTypeController.dispose();
    _deskPadController.dispose();
    _deskTypeController.dispose();
    _tagsController.dispose();
    super.dispose();
  }

  Future<void> _submitReview() async {
    if (_formKey.currentState!.validate()) {
      final reviewProvider = Provider.of<ReviewProvider>(context, listen: false);
      
      final tags = _tagsController.text
          .split(',')
          .map((tag) => tag.trim())
          .where((tag) => tag.isNotEmpty)
          .toList();

      final success = await reviewProvider.createReview(
        title: _titleController.text.trim(),
        content: _contentController.text.trim(),
        keyboardFrame: _keyboardFrameController.text.trim(),
        switchType: _switchTypeController.text.trim(),
        keycapType: _keycapTypeController.text.trim(),
        deskPad: _deskPadController.text.trim().isEmpty 
            ? null 
            : _deskPadController.text.trim(),
        deskType: _deskTypeController.text.trim().isEmpty 
            ? null 
            : _deskTypeController.text.trim(),
        soundRating: _soundRating,
        feelRating: _feelRating,
        overallRating: _overallRating,
        tags: tags.isEmpty ? null : tags,
      );

      if (success && mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('리뷰가 성공적으로 작성되었습니다!'),
            backgroundColor: Colors.green,
          ),
        );
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('리뷰 작성에 실패했습니다. 다시 시도해주세요.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('리뷰 작성'),
        actions: [
          Consumer<ReviewProvider>(
            builder: (context, reviewProvider, child) {
              return TextButton(
                onPressed: reviewProvider.isLoading ? null : _submitReview,
                child: reviewProvider.isLoading
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('완료'),
              );
            },
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 제목
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: '제목',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return '제목을 입력해주세요';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // 키보드 정보
              Text(
                '키보드 정보',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              
              TextFormField(
                controller: _keyboardFrameController,
                decoration: const InputDecoration(
                  labelText: '키보드 프레임',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return '키보드 프레임을 입력해주세요';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _switchTypeController,
                decoration: const InputDecoration(
                  labelText: '스위치 종류',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return '스위치 종류를 입력해주세요';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _keycapTypeController,
                decoration: const InputDecoration(
                  labelText: '키캡 종류',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return '키캡 종류를 입력해주세요';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _deskPadController,
                decoration: const InputDecoration(
                  labelText: '데스크 패드 (선택사항)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _deskTypeController,
                decoration: const InputDecoration(
                  labelText: '책상 종류 (선택사항)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 24),

              // 평점
              Text(
                '평점',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),

              _buildRatingSection('소리 평점', _soundRating, (rating) {
                setState(() {
                  _soundRating = rating;
                });
              }),
              const SizedBox(height: 16),

              _buildRatingSection('타감 평점', _feelRating, (rating) {
                setState(() {
                  _feelRating = rating;
                });
              }),
              const SizedBox(height: 16),

              _buildRatingSection('전체 평점', _overallRating, (rating) {
                setState(() {
                  _overallRating = rating;
                });
              }),
              const SizedBox(height: 24),

              // 내용
              TextFormField(
                controller: _contentController,
                decoration: const InputDecoration(
                  labelText: '리뷰 내용',
                  border: OutlineInputBorder(),
                  alignLabelWithHint: true,
                ),
                maxLines: 8,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return '리뷰 내용을 입력해주세요';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // 태그
              TextFormField(
                controller: _tagsController,
                decoration: const InputDecoration(
                  labelText: '태그 (쉼표로 구분)',
                  border: OutlineInputBorder(),
                  helperText: '예: 조용함, 부드러움, 게이밍',
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRatingSection(String title, double rating, Function(double) onRatingUpdate) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            RatingBar.builder(
              initialRating: rating,
              minRating: 0,
              direction: Axis.horizontal,
              allowHalfRating: true,
              itemCount: 5,
              itemSize: 32,
              itemBuilder: (context, _) => const Icon(
                Icons.star,
                color: Colors.amber,
              ),
              onRatingUpdate: onRatingUpdate,
            ),
            const SizedBox(width: 16),
            Text(
              rating.toStringAsFixed(1),
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ],
    );
  }
} 
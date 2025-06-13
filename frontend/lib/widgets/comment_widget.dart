import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/comment.dart';
import '../services/api_service.dart';

class CommentWidget extends StatefulWidget {
  final Comment comment;
  final VoidCallback onCommentUpdated;

  const CommentWidget({
    Key? key,
    required this.comment,
    required this.onCommentUpdated,
  }) : super(key: key);

  @override
  State<CommentWidget> createState() => _CommentWidgetState();
}

class _CommentWidgetState extends State<CommentWidget> {
  bool _isEditing = false;
  bool _isLoading = false;
  final TextEditingController _editController = TextEditingController();
  String? _currentUserId;

  @override
  void initState() {
    super.initState();
    _editController.text = widget.comment.content;
    _loadCurrentUser();
  }

  @override
  void dispose() {
    _editController.dispose();
    super.dispose();
  }

  Future<void> _loadCurrentUser() async {
    try {
      final result = await ApiService.getCurrentUser();
      final user = result['user'];
      setState(() {
        _currentUserId = user?['id'];
      });
    } catch (e) {
      print('현재 사용자 정보 로드 실패: $e');
    }
  }

  bool get _isMyComment => _currentUserId == widget.comment.userId;

  Future<void> _updateComment() async {
    if (_editController.text.trim().isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('댓글 내용을 입력해주세요.')));
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      await ApiService.updateComment(
        commentId: widget.comment.id,
        content: _editController.text.trim(),
      );

      setState(() {
        _isEditing = false;
      });

      widget.onCommentUpdated();

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('댓글이 수정되었습니다.')));
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('댓글 수정에 실패했습니다: $e')));
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _deleteComment() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('댓글 삭제'),
        content: const Text('정말로 이 댓글을 삭제하시겠습니까?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('삭제'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() {
      _isLoading = true;
    });

    try {
      await ApiService.deleteComment(widget.comment.id);
      widget.onCommentUpdated();

      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('댓글이 삭제되었습니다.')));
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('댓글 삭제에 실패했습니다: $e')));
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey[200]!, width: 1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 사용자 정보 및 작성 시간
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: Theme.of(context).primaryColor,
                child: Text(
                  (widget.comment.user?.username ?? '익명')[0].toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.comment.user?.username ?? '익명 사용자',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      DateFormat(
                        'yyyy.MM.dd HH:mm',
                      ).format(widget.comment.createdAt),
                      style: Theme.of(
                        context,
                      ).textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
              // 수정/삭제 버튼 (본인 댓글만)
              if (_isMyComment && !_isLoading) ...[
                PopupMenuButton<String>(
                  onSelected: (value) {
                    if (value == 'edit') {
                      setState(() {
                        _isEditing = true;
                      });
                    } else if (value == 'delete') {
                      _deleteComment();
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(value: 'edit', child: Text('수정')),
                    const PopupMenuItem(value: 'delete', child: Text('삭제')),
                  ],
                  child: const Icon(Icons.more_vert, color: Colors.grey),
                ),
              ],
              if (_isLoading)
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
            ],
          ),
          const SizedBox(height: 12),

          // 댓글 내용
          if (_isEditing) ...[
            TextField(
              controller: _editController,
              maxLines: null,
              decoration: const InputDecoration(
                hintText: '댓글을 입력하세요...',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: _isLoading
                      ? null
                      : () {
                          setState(() {
                            _isEditing = false;
                            _editController.text = widget.comment.content;
                          });
                        },
                  child: const Text('취소'),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _isLoading ? null : _updateComment,
                  child: _isLoading
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('수정'),
                ),
              ],
            ),
          ] else ...[
            Text(
              widget.comment.content,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ],
      ),
    );
  }
}

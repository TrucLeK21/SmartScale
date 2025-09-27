import 'package:flutter/material.dart';
import 'package:health_app/models/message.dart';
import 'package:health_app/models/user.dart';
import 'package:health_app/services/claude_api_services.dart';

class ChatProvider with ChangeNotifier {
  final _apiService = ClaudeApiServices();

  User? user;
  List<dynamic>? latestRecord;
  Map<String, dynamic> record = {};

  // Messages and Loading
  final List<Message> _messages = [];
  final List<Message> _suggestions = [
    Message(
      content: "Hãy đánh giá tổng quát dựa trên các chỉ số sức khỏe của tôi",
      isUser: false,
      timestamp: DateTime.now(),
    ),
    Message(
      content: "Các chế độ dinh dưỡng phù hợp để giảm cân",
      isUser: false,
      timestamp: DateTime.now(),
    ),
    Message(
      content: "Các chế độ dinh dưỡng phù hợp để tăng cơ",
      isUser: false,
      timestamp: DateTime.now(),
    ),
    Message(
      content: "Các bài tập phù hợp để tăng cơ giảm mỡ",
      isUser: false,
      timestamp: DateTime.now(),
    ),
  ];
  bool _isLoading = false;

  // Getters
  List<Message> get messages => _messages;
  List<Message> get suggestions => _suggestions;
  bool get isLoading => _isLoading;

  // Send message
  Future<void> sendMessage(String content) async {
    // prevent empty sends
    if (content.trim().isEmpty) return;

    // user message
    final userMessage = Message(
      content: content,
      isUser: true,
      timestamp: DateTime.now(),
    );

    // add user message to chat
    _messages.add(userMessage);

    // update UI
    notifyListeners();

    // start loading
    _isLoading = true;

    // update UI
    notifyListeners();

    // send message and receive response
    try {
      final response = await _apiService.sendMessage(_buildClaudeMessages());

      final responseMessage = Message(
        content: response,
        isUser: false,
        timestamp: DateTime.now(),
      );

      _messages.add(responseMessage);
    } catch (e) {
      final errorMessage = Message(
        content: "Xin lỗi, đã có lỗi xảy ra: $e",
        isUser: false,
        timestamp: DateTime.now(),
      );

      _messages.add(errorMessage);
    }
    _isLoading = false;

    notifyListeners();
  }

  void clearMessages() {
    _messages.clear();
    notifyListeners();
  }

  List<Map<String, String>> _buildClaudeMessages() {
    List<Map<String, String>> history = [];

    // Nếu không có tin nhắn thì return rỗng
    if (_messages.isEmpty) return history;

    // Lấy tối đa 10 tin nhắn gần nhất, bao gồm cả tin nhắn đầu tiên (system prompt)
    final recentMessages = _messages.take(20).toList();

    for (var message in recentMessages) {
      history.add({
        'role': message.isUser ? 'user' : 'assistant',
        'content': message.content,
      });
    }

    return history;
  }
}

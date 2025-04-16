import 'package:flutter/material.dart';
import 'package:health_app/models/message.dart';
import 'package:health_app/services/claude_api_services.dart';

class ChatProvider with ChangeNotifier {
  final _apiService = ClaudeApiServices(apiKey: "YOUR_API_KEY");

  // Messages and Loading
  final List<Message> _messages = [];
  bool _isLoading = false;

  // Getters
  List<Message> get messages => _messages;
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
      final response = await _apiService.sendMessage(content);

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
}

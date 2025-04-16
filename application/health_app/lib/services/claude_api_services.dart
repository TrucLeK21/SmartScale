/*
  Services class to handle Claude API stuff...
*/

import 'dart:convert';

import 'package:http/http.dart' as http;

class ClaudeApiServices {
  static const String _baseUrl = "https://api.anthropic.com/v1/messages";
  static const String _apiVersion = "2023-06-01";
  static const String _model = "claude-3-7-sonnet-20250219";
  static const int _maxTokens = 1024;

  // Store API key
  final String _apiKey;

  // Require API key
  ClaudeApiServices({required String apiKey}) : _apiKey = apiKey;

  /* 
    Send a message to Claude API and return the response
  */

  Future<String> sendMessage(String content) async {
    try {
      // Make POST request to Claude API
      final response = await http.post(
        Uri.parse(_baseUrl),
        headers: _getHeaders(),
        body: _getRequestBody(content),
      );

      // check if request was successful
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['content'][0]['text'];
      } else {
        throw Exception(
            'Failed to get response from Claude: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('API Error ${e}');
    }
  }

  Map<String, String> _getHeaders() => {
        'Content-Type': 'application/json',
        'x-api-key': _apiKey,
        'anthropic-version': _apiVersion,
      };

  String _getRequestBody(String content) => jsonEncode({
        'model': _model,
        'message': [
          {'role': 'user', 'content': content},
        ],
        'max_tokens': _maxTokens,
      });
}

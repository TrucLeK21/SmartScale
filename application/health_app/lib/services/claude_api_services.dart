/*
  Services class to handle Claude API stuff...
*/

import 'dart:convert';

import 'package:health_app/models/user.dart';
import 'package:health_app/services/user_services.dart';
import 'package:http/http.dart' as http;

class ClaudeApiServices {
  static const String _baseUrl = "https://api.anthropic.com/v1/messages";
  static const String _apiVersion = "2023-06-01";
  static const String _model = "claude-3-5-sonnet-20241022";
  static const int _maxTokens = 1024;

  // Store API key
  final String _apiKey;
  User? _user;
  List<dynamic>? _latestRecord;
  Map<String, dynamic> record = {};

  // Require API key
  ClaudeApiServices({required String apiKey}) : _apiKey = apiKey;

  // Hàm lấy thông tin người dùng
  Future<void> _loadUserProfile() async {
    try {
      final profile = await userServices().profile();
      final res = await userServices().getLatestRecord(null);

      if (profile != null) {
        _user = profile;
        if (res != null) {
          _latestRecord = res;
          record = {
            for (var item in _latestRecord!) item['key']: item['value']
          };
        }
      } else {
        print('Không thể tải thông tin người dùng');
      }
    } catch (e) {
      print('Lỗi khi tải thông tin người dùng: $e');
    }
  }

//system prompt
  String _buildSystemPrompt() {
    String prompt = """
Bạn hãy vào vai là một chuyên gia về dinh dưỡng, thể hình và sức khỏe tổng quát.  
Hãy trả lời câu hỏi của người dùng dựa trên các thông tin và chỉ số sức khỏe dưới đây.

## Thông tin người dùng:
- Giới tính: ${_user?.gender}
- Chủng tộc: ${_user?.race ?? 'Không rõ'}
- Mức độ vận động: ${_user?.activityFactor}

## Các chỉ số sức khỏe gần nhất:
- Tuổi: ${record['age'] ?? 'Không rõ'}
- Chiều cao: ${record['height']} cm
- Cân nặng: ${record['weight']} kg
- Tỷ lệ mỡ cơ thể: ${record['fatPercentage']}%
- Khối lượng cơ: ${record['muscleMass']} kg
- Tỷ lệ nước: ${record['waterPercentage']}%
- Khối lượng xương: ${record['boneMass']} kg
- Tỷ lệ protein trong cơ thể: ${record['proteinPercentage']}%
- Mỡ nội tạng: ${record['visceralFat']}
- BMI: ${record['bmi']}
- BMR: ${record['bmr']}
- TDEE: ${record['tdee']}
- LBM (khối nạc không mỡ): ${record['lbm']}
- Cân nặng lý tưởng: ${record['idealWeight']} kg

### Thang đo mức độ vận động tham khảo:
- 1.2: Ít vận động (ngồi nhiều, ít đi lại)
- 1.375: Vận động nhẹ (đi bộ nhẹ, ít tập luyện)
- 1.55: Vận động vừa (tập thể thao 3-5 ngày/tuần)
- 1.725: Vận động nhiều (tập thể thao 6-7 ngày/tuần)
- 1.9: Vận động rất nhiều (tập nặng, vận động viên)

## Hướng dẫn trả lời:
- Hãy trả lời ngắn ngọn, tổng quát và rõ ràng
- Nếu người dùng hỏi những câu không liên quan đến sức khỏe, hãy trả lời: 
  "Xin lỗi, câu hỏi của bạn không nằm trong chuyên môn của tôi."
""";

    return prompt;
  }
  /* 
    Send a message to Claude API and return the response
  */

  Future<String> sendMessage(List<Map<String, String>> messages) async {
    try {
      await _loadUserProfile();
      // Make POST request to Claude API
      final response = await http.post(
        Uri.parse(_baseUrl),
        headers: _getHeaders(),
        body: _getRequestBody(messages),
      );

      // check if request was successful
      if (response.statusCode == 200) {
        final decodedBody = utf8.decode(response.bodyBytes);
        final data = jsonDecode(decodedBody);
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

  String _getRequestBody(List<Map<String, String>> messages) => jsonEncode({
        'model': _model,
        'system': _buildSystemPrompt(),
        'messages': messages,
        'max_tokens': _maxTokens,
      });
}

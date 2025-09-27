/*
  Services class to handle Claude API stuff...
*/

import 'dart:convert';

import 'package:health_app/models/user.dart';
import 'package:health_app/services/user_services.dart';
import 'package:health_app/services/user_session.dart';
import 'package:health_app/services/http_services.dart';

class ClaudeApiServices {

  final HttpServices _httpServices = HttpServices();

  User? _user;
  List<dynamic>? _latestRecord;
  Map<String, dynamic> record = {};

  // Require API key
  ClaudeApiServices();
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

  /* 
    Send a message to Claude API and return the response
  */

  Future<String> sendMessage(List<Map<String, String>> messages) async {
    String? token = UserSession().token;
    Map<String, String> header = {};
    if (token != null) {
      header['Authorization'] = 'Bearer $token';
    }

    try {
      await _loadUserProfile();
      final data = {
        "profile": _user?.toJson(), // class phải có hàm toJson()
        "record": record,
        "messages": messages,
      };

      final response = await _httpServices.post('/ai/chat',headers: header, data: data);

      // check if request was successful
      if (response!.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data["message"];
      } else {
        throw Exception(
            'Failed to get response from Claude: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('API Error ${e}');
    }
  }

}

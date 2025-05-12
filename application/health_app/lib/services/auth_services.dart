import 'package:health_app/services/google_signin_api.dart';
import 'package:health_app/services/http_services.dart';
import 'package:health_app/services/user_session.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class AuthServices {
  final HttpServices _httpServices = HttpServices();

  Future<http.Response> register(Map<String, dynamic> data) async {
    final res = await _httpServices.post('/auth/register', data: data);

    return res!;
  }

  Future<http.Response?> login(Map<String, dynamic> data) async {
    final res = await _httpServices.post('/auth/login', data: data);

    if (res?.statusCode == 200 || res?.statusCode == 202) {
      // Kiểm tra và cập nhật session với token
      data = jsonDecode(res!.body);
      UserSession().updateSession(token: data['token']);
      return res;
    } else {
      return null; // Trả về false nếu có lỗi
    }
  }

  Future<void> logout() async {
    final res = await _httpServices.post('/auth/logout');
    GoogleSignInApi.logout();
    if(res!.statusCode == 200){
      UserSession().clear();
    }

  }
}

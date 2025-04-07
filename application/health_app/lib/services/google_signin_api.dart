import 'dart:convert';

import 'package:google_sign_in/google_sign_in.dart';
import 'package:health_app/consts.dart';
import 'package:health_app/services/http_services.dart';
import 'package:health_app/services/user_session.dart';
import 'package:http/http.dart' as http;

class GoogleSignInApi {
  final HttpServices _httpServices = HttpServices();

  static final _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
    serverClientId: clientId,
  );

  static Future<GoogleSignInAccount?> login() => _googleSignIn.signIn();
  static Future<GoogleSignInAuthentication?> auth(GoogleSignInAccount user) =>
      user.authentication;
  static Future logout() => _googleSignIn.disconnect();

  Future<http.Response?> googleSignIn() async {
    try {
      var user = await GoogleSignInApi.login();
      if (user == null) {
        return http.Response(
            jsonEncode({'error': 'Người dùng không xác định'}), 400);
      }

      var googleAuth = await GoogleSignInApi.auth(user);

      if (googleAuth == null || googleAuth.idToken == null) {
        return http.Response(
            jsonEncode({'error': 'Không lấy được token người dùng'}), 400);
      }

      Map<String, dynamic> data = {
        "idToken": googleAuth.idToken
      };

      final res = await _httpServices.post('/auth/google', data: data);

      if(res?.statusCode == 200 || res?.statusCode == 202) {
        data = jsonDecode(res!.body);
        UserSession().updateSession(token: data['token']);
      }
      return res;

    } catch (e) {
      print(e);
      return null;
    }
  }
}

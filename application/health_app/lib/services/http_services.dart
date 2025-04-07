import 'package:http/http.dart' as http;
import 'package:health_app/consts.dart';
import 'dart:convert';

class HttpServices {
  static final HttpServices _singleton = HttpServices._internal();
  factory HttpServices() {
    return _singleton;
  }

  HttpServices._internal() {
    setup();
  }
  String _baseUrl = '';
  Map<String, String> _defaultHeaders = {'Content-Type': 'application/json'};

  /// Cấu hình dịch vụ
  void setup({String? bearerToken}) {
    _baseUrl = API_URL;
    if (bearerToken != null) {
      _defaultHeaders['Authorization'] = 'Bearer $bearerToken';
    }
  }

  //GET request
  Future<http.Response?> get(String path,
      {Map<String, String>? headers}) async {
    final uri = Uri.parse('$_baseUrl$path');
    try {
      final response =
          await http.get(uri, headers: {..._defaultHeaders, ...?headers});
      return response;
    } catch (e) {
      print('GET request error: $e');
      return http.Response(e.toString(), 500);
    }
  }

  /// POST request
  Future<http.Response?> post(String path,
      {Map<String, dynamic>? data, Map<String, String>? headers}) async {
    final uri = Uri.parse('$_baseUrl$path');
    print(uri);
    try {
      final response = await http.post(
        uri,
        headers: {..._defaultHeaders, ...?headers},
        body: data != null ? jsonEncode(data) : null,
      );
      return response;
    } catch (e) {
      print('POST request error: $e');
      return http.Response(e.toString(), 500);
    }
  }

  //PUT request
  Future<http.Response?> put(String path, Map<String, dynamic>? data,
      {Map<String, String>? headers}) async {
    final uri = Uri.parse('$_baseUrl$path');
    try {
      final response = await http.put(
        uri,
        headers: {..._defaultHeaders, ...?headers},
        body: data != null ? jsonEncode(data) : null,
      );
      return response;
    } catch (e) {
      print('POST request error: $e');
      return http.Response(e.toString(), 500);
    }
  }
}

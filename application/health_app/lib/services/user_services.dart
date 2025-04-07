import 'dart:convert';
import 'package:health_app/services/user_session.dart';
import 'package:health_app/services/http_services.dart';
import 'package:health_app/models/user.dart';

class userServices {
  Future<User?> profile() async {
    String? token = UserSession().token;
    Map<String, String> header = {};
    if (token != null) {
      header['Authorization'] = 'Bearer $token';
    }

    final res = await HttpServices().get('/users/profile', headers: header);
    if (res!.statusCode == 200) {
      Map<String, dynamic> data = jsonDecode(res.body);
      User user = User.fromJson(data);
      return user;
    } else {
      return null;
    }
  }

    Future<User?> getMemberInfo(int id) async {
    String? token = UserSession().token;
    Map<String, String> header = {};
    if (token != null) {
      header['Authorization'] = 'Bearer $token';
    }

    final res = await HttpServices().get('/groups/members/$id', headers: header);
    if (res!.statusCode == 200) {
      Map<String, dynamic> data = jsonDecode(res.body);
      User user = User.fromJson(data);
      return user;
    } else {
      return null;
    }
  }

  Future<bool?> update(Map<String, dynamic> data) async {
    String? token = UserSession().token;
    Map<String, String> header = {};
    if (token != null) {
      header['Authorization'] = 'Bearer $token';
    }
    final res =
        await HttpServices().put('/users/update', data, headers: header);
    if (res!.statusCode == 200) {
      // Map<String, dynamic> data = jsonDecode(res.body);
      return true;
    } else {
      return false;
    }
  }

  Future<List<dynamic>?> getLatestRecord(int? memId) async {
    String? token = UserSession().token;
    Map<String, String> header = {};
    if (token != null) {
      header['Authorization'] = 'Bearer $token';
    }
    final res;
    if(memId != null)
    {
      res = await HttpServices().get('/users/latestRecord/$memId', headers: header);
    }
    else
    {
      res = await HttpServices().get('/users/latestRecord', headers: header);
    }
    if (res!.statusCode == 200) {
      return jsonDecode(res.body);
    } else {
      return null;
    }
  }

  Future<List<dynamic>?> getMetricRecords(String metric, int? userId) async {
    String? token = UserSession().token;
    Map<String, String> header = {};
    if (token != null) {
      header['Authorization'] = 'Bearer $token';
    }
    if(userId != null){
      header['userid'] = userId.toString();
    }
    print(header);
    final res = await HttpServices().get('/users/records/$metric', headers: header);
    if (res!.statusCode == 200) 
    {
        return jsonDecode(res.body);
    }
    else 
    {
      return null;
    }
  }
}

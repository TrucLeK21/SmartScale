import 'dart:convert';
import 'package:health_app/services/user_session.dart';
import 'package:health_app/services/http_services.dart';
import 'package:health_app/models/group.dart';

class groupServices {
  final HttpServices _httpServices = HttpServices();

  Future<bool> create(Map<String, dynamic> data) async {
    String? token = UserSession().token;
    Map<String, String> header = {};
    if (token != null) {
      header['Authorization'] = 'Bearer $token';
    }
    final res =
        await _httpServices.post('/groups/create', data: data, headers: header);
    if (res!.statusCode == 200) {
      return true;
    } else {
      return false;
    }
  }

  Future<bool> join(Map<String, dynamic> data) async {
    String? token = UserSession().token;
    Map<String, String> header = {};
    if (token != null) {
      header['Authorization'] = 'Bearer $token';
    }
    final res =
        await _httpServices.post('/groups/join', data: data, headers: header);
    if (res!.statusCode == 200) {
      return true;
    } else {
      return false;
    }
  }

  Future<Group?> getUserGroup() async {
    String? token = UserSession().token;
    Map<String, String> header = {};
    if (token != null) {
      header['Authorization'] = 'Bearer $token';
    }

    final res = await HttpServices().get('/groups/userGroup', headers: header);
    if (res!.statusCode == 200) {
      Map<String, dynamic> data = jsonDecode(res.body);
      Group group = Group.fromJson(data);
      return group;
    } else {
      return null;
    }
  }

  Future<List<dynamic>?> getMembers() async {
    String? token = UserSession().token;
    Map<String, String> header = {};
    if (token != null) {
      header['Authorization'] = 'Bearer $token';
    }

    final res = await HttpServices().get('/groups/members', headers: header);
    if (res!.statusCode == 200) {
      Map<String, dynamic> data = jsonDecode(res.body);
      List<dynamic> users = data['users'];
      return users;
    } else {
      return null;
    }
  }

  Future<bool> deleteGroup() async {
    String? token = UserSession().token;
    Map<String, String> header = {};
    if (token != null) {
      header['Authorization'] = 'Bearer $token';
    }
    final res =
        await _httpServices.post('/groups/delete', headers: header);
    if (res!.statusCode == 200) {
      return true;
    } else {
      return false;
    }
  }

  Future<bool> leave() async {
    String? token = UserSession().token;
    Map<String, String> header = {};
    if (token != null) {
      header['Authorization'] = 'Bearer $token';
    }
    final res = await HttpServices().post('/groups/leave', headers: header);
    if (res!.statusCode == 200) {
      return true;
    } else {
      return false;
    }
  }
}

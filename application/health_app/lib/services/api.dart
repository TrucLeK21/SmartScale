import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:health_app/consts.dart';

class Api {
  //post method
  static createUser(Map userData) async {
    print(userData);
    var url = Uri.parse(API_URL + "create_user");
    try {
      final res = await http.post(url, body: userData);
      if (res.statusCode == 200) {
        var data = jsonDecode(res.body.toString());
        print(data);
      } else {
        print("Failed");
      }
    } catch (e) {
      print(e.toString());
    }
  }

  //get method
  static getUser() async {
    var url = Uri.parse(API_URL + "get_user");
    try {
      final res = await http.get(url);
      if (res.statusCode == 200) {
        var data = jsonDecode(res.body);
        print(data);
      } else {
        print("Failed");
      }
    } catch (e) {
      print(e.toString());
    }
  }
}

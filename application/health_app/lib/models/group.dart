import 'dart:convert';

class Group {
  int id;
  String name;
  DateTime createdDate;
  List<int> members;
  int owner;
  String password;

  // Constructor
  Group({
    required this.id,
    required this.name,
    required this.createdDate,
    required this.members,
    required this.owner,
    required this.password,
  });

  // Phương thức factory để khởi tạo Group từ Map (chẳng hạn dữ liệu JSON)
  factory Group.fromJson(Map<String, dynamic> json) {
    return Group(
      id: json['id'],
      name: json['name'],
      createdDate: DateTime.parse(json['createdDate']),
      members: List<int>.from(json['members']),
      owner: json['owner'],
      password: json['password'],
    );
  }

  // Phương thức để chuyển Group thành Map (chẳng hạn lưu trữ trong cơ sở dữ liệu)
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'createdDate': createdDate.toIso8601String(),
      'members': members,
      'owner': owner,
      'password': password,
    };
  }

  @override
  String toString() {
    return jsonEncode(toJson());
  }
}

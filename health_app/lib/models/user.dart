import 'dart:convert';
import './metrics.dart';

class User {
  int id;
  String? googleId;
  String? email;
  String username;
  String password;
  String? fullName;
  DateTime? dateOfBirth;
  String? gender;
  double? activityFactor;
  int? group;
  Map<String, dynamic>? overviewScore;
  String? race;
  List<Metrics>? records;

  User({
    required this.id,
    required this.googleId,
    required this.email,
    required this.username,
    required this.password,
    this.fullName,
    this.dateOfBirth,
    this.gender,
    this.activityFactor,
    this.group,
    this.overviewScore,
    this.race,
    this.records,
  });

  // Phương thức tạo đối tượng User từ JSON
  factory User.fromJson(Map<String, dynamic> json) {
    // json.forEach((key, value) {
    //   print('Field: $key, Type: ${value.runtimeType}, Value: $value');
    // });
    return User(
      id: json['id'] ?? 1, // Gán giá trị mặc định 0 nếu 'id' là null
      googleId: json['googleId'] ?? null,
      email: json['email'] ?? null ,
      username:
          json['username'] ?? '', // Gán giá trị mặc định nếu 'username' là null
      password:
          json['password'] ?? '', // Gán giá trị mặc định nếu 'password' là null
      fullName: json['fullName'],
      dateOfBirth: json['dateOfBirth'] != null
          ? DateTime.parse(json['dateOfBirth'])
          : null,
      gender: json['gender'] ?? '',
      activityFactor: json['activityFactor'] ?? 1.2,
      group: json['group'] ?? null,
      overviewScore: json['overviewScore'] ?? null,
      race: json['race'] ?? null,
      records: json['records'] != null
          ? List<Map<String, dynamic>>.from(json['records'])
              .map((x) => Metrics.fromJson(x))
              .toList()
          : [], // Trả về danh sách rỗng nếu không có 'records'
    );
  }

  // Phương thức chuyển đối tượng User thành JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'googleId': googleId,
      'email': email,
      'username': username,
      'password': password,
      'fullName': fullName,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'gender': gender,
      'activityFactor': activityFactor,
      'group': group,
      'overviewScore': overviewScore,
      'race': race,
      'records': records?.map((x) => x.toJson()).toList(),
    };
  }

  User copyWith({
    int? id,
    String? googleId,
    String? email,
    String? username,
    String? password,
    String? fullName,
    DateTime? dateOfBirth,
    String? gender,
    double? activityFactor,
    int? group,
    Map<String, dynamic>? overviewScore,
    String? race,
    List<Metrics>? records,
  }) =>
      User(
        id: id ?? this.id,
        googleId: googleId ?? this.googleId,
        email: email ?? this.email,
        username: username ?? this.username,
        password: password ?? this.password,
        fullName: fullName ?? this.fullName,
        dateOfBirth: dateOfBirth ?? this.dateOfBirth,
        gender: gender ?? this.gender,
        activityFactor: activityFactor ?? this.activityFactor,
        group: group ?? this.group,
        overviewScore: overviewScore ?? this.overviewScore,
        race: race ?? this.race,
        records: records ?? this.records,
      );

  // Lấy bản ghi mới nhất từ records
  Metrics? getLatestRecord() {
    if (records != null && records!.isNotEmpty) {
      records!.sort(
          (a, b) => b.date!.compareTo(a.date!)); // Sắp xếp theo ngày giảm dần
      return records!.first;
    }
    return null; // Trả về null nếu không có bản ghi
  }



  @override
  String toString() {
    return jsonEncode(toJson());
  }
}

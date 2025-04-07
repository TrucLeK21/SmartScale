import 'dart:convert';

class Metrics {
  DateTime? date;
  double? height;
  double? weight;
  int? age;
  double? bmi;
  double? bmr;
  double? tdee;
  double? lbm;
  double? fatPercentage;
  double? waterPercentage;
  double? boneMass;
  double? muscleMass;
  double? proteinPercentage;
  double? visceralFat;
  double? idealWeight;

  Metrics({
    this.date,
    this.height,
    this.weight,
    this.age,
    this.bmi,
    this.bmr,
    this.tdee,
    this.lbm,
    this.fatPercentage,
    this.waterPercentage,
    this.boneMass,
    this.muscleMass,
    this.proteinPercentage,
    this.visceralFat,
    this.idealWeight,
  });

  // Phương thức tạo đối tượng Metrics từ JSON
  factory Metrics.fromJson(Map<String, dynamic> json) {
    // json.forEach((key, value) {
    //   print('Field: $key, Type: ${value.runtimeType}, Value: $value');
    // });
    return Metrics(
      date: json['date'] != null ? DateTime.parse(json['date']) : null,
      height: json['height'] != null ? double.tryParse(json['height'].toString()) as double : null,
      weight: json['weight'] != null ? double.tryParse(json['weight'].toString()) as double: null,
      age: json['age'] != null ? json['age'] as int : null,
      bmi: json['bmi'] != null ? double.tryParse(json['bmi'].toString()) as double : null,
      bmr: json['bmr'] != null ? double.tryParse(json['bmr'].toString()) as double : null,
      tdee: json['tdee'] != null ? double.tryParse(json['tdee'].toString()) as double : null,
      lbm: json['lbm'] != null ? double.tryParse(json['lbm'].toString()) as double : null,
      fatPercentage: json['fatPercentage'] != null
          ? double.tryParse(json['fatPercentage'].toString()) as double
          : null,
      waterPercentage: json['waterPercentage'] != null
          ? double.tryParse(json['waterPercentage'].toString()) as double
          : null,
      boneMass: json['boneMass'] != null ? double.tryParse(json['boneMass'].toString()) as double : null,
      muscleMass:
          json['muscleMass'] != null ? double.tryParse(json['muscleMass'].toString()) as double : null,
      proteinPercentage: json['proteinPercentage'] != null
          ? double.tryParse(json['proteinPercentage'].toString()) as double
          : null,
      visceralFat:
          json['visceralFat'] != null ? double.tryParse(json['visceralFat'].toString()) as double : null,
      idealWeight:
          json['idealWeight'] != null ? double.tryParse(json['idealWeight'].toString()) as double : null,
    );
  }

  // Phương thức chuyển đối tượng Metrics thành JSON
  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    if (date != null) data['date'] = date?.toIso8601String();
    if (height != null) data['height'] = height;
    if (weight != null) data['weight'] = weight;
    if (age != null) data['age'] = age;
    if (bmi != null) data['bmi'] = bmi;
    if (bmr != null) data['bmr'] = bmr;
    if (tdee != null) data['tdee'] = tdee;
    if (lbm != null) data['lbm'] = lbm;
    if (fatPercentage != null) data['fatPercentage'] = fatPercentage;
    if (waterPercentage != null) data['waterPercentage'] = waterPercentage;
    if (boneMass != null) data['boneMass'] = boneMass;
    if (muscleMass != null) data['muscleMass'] = muscleMass;
    if (proteinPercentage != null)
      data['proteinPercentage'] = proteinPercentage;
    if (visceralFat != null) data['visceralFat'] = visceralFat;
    if (idealWeight != null) data['idealWeight'] = idealWeight;
    return data;
  }

  Metrics copyWith({
    DateTime? date,
    double? height,
    double? weight,
    int? age,
    double? bmi,
    double? bmr,
    double? tdee,
    double? lbm,
    double? fatPercentage,
    double? waterPercentage,
    double? boneMass,
    double? muscleMass,
    double? proteinPercentage,
    double? visceralFat,
    double? idealWeight,
  }) {
    return Metrics(
      date: date ?? this.date,
      height: height ?? this.height,
      weight: weight ?? this.weight,
      age: age ?? this.age,
      bmi: bmi ?? this.bmi,
      bmr: bmr ?? this.bmr,
      tdee: tdee ?? this.tdee,
      lbm: lbm ?? this.lbm,
      fatPercentage: fatPercentage ?? this.fatPercentage,
      waterPercentage: waterPercentage ?? this.waterPercentage,
      boneMass: boneMass ?? this.boneMass,
      muscleMass: muscleMass ?? this.muscleMass,
      proteinPercentage: proteinPercentage ?? this.proteinPercentage,
      visceralFat: visceralFat ?? this.visceralFat,
      idealWeight: idealWeight ?? this.idealWeight,
    );
  }

  @override
  String toString() {
    return jsonEncode(toJson());
  }
}

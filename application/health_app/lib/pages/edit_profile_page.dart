import 'package:flutter/material.dart';
// import 'dart:io';

import 'package:health_app/consts.dart';
import 'package:health_app/models/metrics.dart';
import 'package:health_app/models/user.dart';
import 'package:health_app/services/user_services.dart';

class EditProfilePage extends StatefulWidget {
  const EditProfilePage({super.key});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();
  final _fullnameController = TextEditingController();
  final _heightController = TextEditingController();
  final _weightController =
      TextEditingController(); // Thêm controller cho cân nặng
  String? _selectedGender;
  DateTime? _selectedDate;
  double? _selectedActivityFactor;
  final List<String> _genderOptions = ['Nam', 'Nữ'];
  final List<Map<String, double>> _activityFactorOptions = [
    {"Ít hoạt động": 1.2},
    {"Vận động nhẹ": 1.375},
    {"Vận động vừa": 1.55},
    {"Vận động nhiều": 1.725},
    {"Vận động rất nhiều": 1.9}
  ];
  User? user;
  Metrics? lastestRecord;

  @override
  void initState() {
    super.initState();
    // Gọi hàm lấy thông tin người dùng khi trang được tải
    _loadUserProfile();
  }

  void _loadUserProfile() async {
    try {
      final profile = await userServices().profile();

      if (profile != null) {
        setState(() {
          user = profile;
          lastestRecord = profile.getLatestRecord();
          _fullnameController.text = user!.fullName ?? ''; // Gán giá trị
          _heightController.text = lastestRecord?.height.toString() ?? '';
          _weightController.text = lastestRecord?.weight.toString() ?? '';
          _selectedGender = user?.gender == "" ? "male" : user?.gender;
          _selectedDate = user?.dateOfBirth;
          _selectedActivityFactor = user?.activityFactor;
          print(_selectedGender);
        });
      } else {
        print('Không thể tải thông tin người dùng');
      }
    } catch (e) {
      print('Lỗi khi tải thông tin người dùng: $e');
    }
  }

  // bool isAnyFieldFilled() {
  //   return _fullnameController.text.isNotEmpty ||
  //       _heightController.text.isNotEmpty ||
  //       _weightController.text.isNotEmpty ||
  //       _selectedGender != null ||
  //       _selectedDate != null;
  // }

  @override
  Widget build(BuildContext context) {
    // if (user == null) {
    //   return const Center(
    //     child:
    //         CircularProgressIndicator(), // Hiển thị vòng xoay khi chưa có dữ liệu
    //   );
    // }
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.superLightGray,
        title: const Text("Chỉnh sửa hồ sơ"),
        centerTitle: true,
      ),
      body: _buildUI(),
    );
  }

  Widget _buildUI() {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.superLightGray,
      ),
      padding: const EdgeInsets.all(16.0),
      width: double.infinity,
      height: double.infinity,
      child: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 20),
        
              // Họ và tên
              TextFormField(
                controller: _fullnameController,
                decoration: const InputDecoration(
                  labelText: 'Họ và tên',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Vui lòng nhập họ và tên';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
        
              // Giới tính
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Giới tính',
                  border: OutlineInputBorder(),
                ),
                value: _selectedGender == "male" ? "Nam" : "Nữ" ,
                items: _genderOptions
                    .map((gender) => DropdownMenuItem(
                          value: gender,
                          child: Text(gender),
                        ))
                    .toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedGender = value == "Nam" ? "male" : "female";
                  });
                },
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Vui lòng chọn giới tính';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
        
              // Ngày sinh
              GestureDetector(
                onTap: () async {
                  DateTime? pickedDate = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now(),
                    firstDate: DateTime(1900),
                    lastDate: DateTime.now(),
                  );
                  if (pickedDate != null) {
                    setState(() {
                      _selectedDate = pickedDate;
                    });
                  }
                },
                child: InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'Ngày sinh',
                    border: OutlineInputBorder(),
                  ),
                  child: Text(
                    _selectedDate != null
                        ? '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}'
                        : 'Chọn ngày sinh',
                    style: TextStyle(
                      color: _selectedDate != null ? Colors.black : Colors.grey,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
        
              // Chiều cao
              TextFormField(
                controller: _heightController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Chiều cao (cm)',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Vui lòng nhập chiều cao';
                  }
                  if (value.isNotEmpty && double.tryParse(value) == null) {
                    return 'Vui lòng nhập số hợp lệ';
                  }
        
                  return null;
                },
              ),
              const SizedBox(height: 16),
        
              // Cân nặng
              TextFormField(
                controller: _weightController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Cân nặng (kg)',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Vui lòng nhập cân nặng';
                  }
                  if (value.isNotEmpty && double.tryParse(value) == null) {
                    return 'Vui lòng nhập số hợp lệ';
                  }
        
                  return null;
                },
              ),
              const SizedBox(height: 16),
        
              // Mức độ hoạt động
              DropdownButtonFormField<double>(
                decoration: const InputDecoration(
                  labelText: 'Mức độ hoạt động',
                  border: OutlineInputBorder(),
                ),
                value: _selectedActivityFactor,
                items: _activityFactorOptions.map((factor) {
                  // Lấy key và value từ map
                  String activityLevel = factor.keys.first; // Key
                  double factorValue = factor.values.first; // Value
        
                  return DropdownMenuItem<double>(
                    value: factorValue, // Set giá trị value là kiểu double
                    child: Text(activityLevel), // Hiển thị key (mức độ hoạt động)
                  );
                }).toList(),
                onChanged: (double? value) {
                  setState(() {
                    _selectedActivityFactor = value; // Cập nhật giá trị
                  });
                },
                validator: (value) {
                  if (value == null) {
                    return 'Vui lòng chọn mức độ hoạt động';
                  }
                  return null;
                },
              ),
              const SizedBox(
                height: 16,
              ),
              // Nút lưu
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  fixedSize: const Size(150, 50),
                ),
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    var data = {
                      "fullName": _fullnameController.text,
                      "dateOfBirth": _selectedDate?.toIso8601String(),
                      "gender": _selectedGender,
                      "height": _heightController.text,
                      "weight": _weightController.text,
                      "activityFactor": _selectedActivityFactor,
                    };
                    var res = await userServices().update(data);
                    if (res == true) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Thông tin đã được lưu thành công'),
                        ),
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Thông tin đã được lưu thất bại'),
                        ),
                      );
                    }
                    Navigator.pushNamedAndRemoveUntil(
                        context, '/home', (route) => false);
                    // Xử lý lưu dữ liệu tại đây
                  }
                },
                child: const Text('Lưu'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

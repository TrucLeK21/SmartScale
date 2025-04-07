import 'package:flutter/material.dart';
import 'package:health_app/consts.dart';
import 'package:health_app/services/group_services.dart';

class CreateGroupPage extends StatefulWidget {
  const CreateGroupPage({super.key});

  @override
  State<CreateGroupPage> createState() => _CreateGroupPageState();
}

class _CreateGroupPageState extends State<CreateGroupPage> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _verifyPasswordController = TextEditingController();

  bool _isObscured1 = true;
  bool _isObscured2 = true;

  void _toggleIsObscured(int idx) {
    setState(() {
      if (idx == 1) {
        _isObscured1 = !_isObscured1;
      } else {
        _isObscured2 = !_isObscured2;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.lightGray,
      ),
      body: _buildUI(),
    );
  }

  Widget _buildUI() {
    return Container(
      color: AppColors.lightGray,
      width: double.infinity,
      height: double.infinity,
      padding: const EdgeInsets.all(40),
      child: Form(
        key: _formKey,
        child: Center(
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Tên người dùng
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    labelText: "Nhập tên nhóm",
                    prefixIcon: Icon(Icons.person),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.all(Radius.circular(10)),
                    ),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Vui lòng nhập tên nhóm';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Mật khẩu
                TextFormField(
                  controller: _passwordController,
                  obscureText: _isObscured1,
                  decoration: InputDecoration(
                    labelText: "Nhập mật khẩu",
                    prefixIcon: const Icon(Icons.lock),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _isObscured1 ? Icons.visibility_off : Icons.visibility,
                      ),
                      onPressed: () {
                        _toggleIsObscured(1);
                      },
                    ),
                    border: const OutlineInputBorder(
                      borderRadius: BorderRadius.all(
                        Radius.circular(10),
                      ),
                    ),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Vui lòng nhập mật khẩu';
                    }
                    if (value.length < 8) {
                      return 'Mật khẩu phải có ít nhất 8 ký tự';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Nhập lại mật khẩu
                TextFormField(
                  controller: _verifyPasswordController,
                  obscureText: _isObscured2,
                  decoration: InputDecoration(
                    labelText: "Nhập lại mật khẩu",
                    prefixIcon: const Icon(Icons.lock),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _isObscured2 ? Icons.visibility_off : Icons.visibility,
                      ),
                      onPressed: () {
                        _toggleIsObscured(2);
                      },
                    ),
                    border: const OutlineInputBorder(
                      borderRadius: BorderRadius.all(
                        Radius.circular(10),
                      ),
                    ),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Vui lòng nhập lại mật khẩu';
                    }
                    if (value != _passwordController.text) {
                      return 'Mật khẩu không khớp';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 50),

                // Nút đăng ký
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      fixedSize: const Size(300, 50),
                      backgroundColor: AppColors.mainColor,
                    ),
                    onPressed: () async {
                      if (_formKey.currentState!.validate()) {
                        var data = {
                          "name": _nameController.text,
                          "password": _passwordController.text,
                        };
                        String message;
                        bool res = await groupServices().create(data);
                        if (res == true) {
                          message = "Tạo nhóm thành công";
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(message)),
                          );
                          Navigator.pushNamedAndRemoveUntil(
                              context, '/family', (route) => false);
                        } else {
                          message = "Tạo nhóm thất bại";
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(message)),
                          );
                        }

                        // try {
                        //   var res = await AuthServices().register(data);

                        //   if (res.statusCode == 200) {
                        //     final loginRes = await AuthServices().login(data);
                        //     if(loginRes?.statusCode == 202)
                        //     {
                        //       Navigator.pushNamedAndRemoveUntil(context, '/edit-profile', (route) => false);

                        //     }
                        //   } else {
                        //     // Xử lý khi mã trạng thái khác 200
                        //     String message = "Registration failed";
                        //     if (res.statusCode == 400) {
                        //       message = "Bad request. Please check your input.";
                        //     } else if (res.statusCode == 500) {
                        //       message = "Server error. Please try again later.";
                        //     }

                        //     // Hiển thị lỗi bằng Snackbar
                        //     ScaffoldMessenger.of(context).showSnackBar(
                        //       SnackBar(content: Text(message)),
                        //     );
                        //   }
                        // } catch (e) {
                        //   // Xử lý trường hợp không thể kết nối với server
                        //   ScaffoldMessenger.of(context).showSnackBar(
                        //     SnackBar(content: Text('An error occurred: $e')),
                        //   );
                        // }
                      }
                    },
                    child: const Text(
                      "Tạo",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

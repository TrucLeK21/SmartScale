import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:health_app/consts.dart';
import 'package:health_app/services/auth_services.dart';
import 'package:health_app/services/google_signin_api.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _isObscured = true;

  final _formKey = GlobalKey<FormState>(); // GlobalKey to manage the form state

  void _toggleIsObscured() {
    setState(() {
      _isObscured = !_isObscured;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _buildUI(),
    );
  }

  Widget _buildUI() {
    return Container(
      color: AppColors.lightGray,
      width: double.infinity,
      height: double.infinity,
      padding: EdgeInsets.all(40),
      child: Form(
        key: _formKey, // Assign the form key to the Form widget
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextFormField(
              controller: _usernameController,
              decoration: const InputDecoration(
                labelText: "Nhập tên người dùng",
                prefixIcon: Icon(Icons.person),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(10)),
                    borderSide: BorderSide(color: Colors.white)),
                filled: true,
                fillColor: Colors.white,
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Vui lòng nhập tên người dùng';
                }
                return null;
              },
            ),
            const SizedBox(
              height: 20,
            ),
            TextFormField(
              controller: _passwordController,
              obscureText: _isObscured,
              decoration: InputDecoration(
                labelText: "Nhập mật khẩu",
                prefixIcon: Icon(Icons.lock),
                suffixIcon: IconButton(
                  icon: Icon(
                    _isObscured ? Icons.visibility_off : Icons.visibility,
                  ),
                  onPressed: () {
                    _toggleIsObscured();
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
                return null;
              },
            ),
            const SizedBox(
              height: 50,
            ),
            Container(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  fixedSize: const Size(300, 50),
                  backgroundColor: AppColors.mainColor,
                ),
                onPressed: () async {
                  if (_formKey.currentState?.validate() ?? false) {
                    var data = {
                      "username": _usernameController.text,
                      "password": _passwordController.text,
                    };

                    var res = await AuthServices().login(data);
                    if (res?.statusCode == 200) {
                      Navigator.pushReplacementNamed(context, "/home");
                    } else if (res?.statusCode == 202) {
                      Navigator.pushReplacementNamed(context, "/edit-profile");
                    } else {
                      String message = "Incorect username or password";

                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(message)),
                      );
                    }
                  }
                },
                child: const Text(
                  "Đăng nhập",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(
              height: 10,
            ),
            Container(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  fixedSize: const Size(double.infinity, 50),
                  backgroundColor: Colors.white,
                ),
                onPressed: () {
                  Navigator.pushNamed(context, "/register");
                },
                child: const Text(
                  "Đăng ký",
                  style: TextStyle(
                    color: Colors.black,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(
              height: 10,
            ),
            Container(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  fixedSize: const Size(double.infinity, 50),
                  backgroundColor: AppColors.appGreen,
                ),
                onPressed: () async {
                  final res = await GoogleSignInApi().googleSignIn();
                  if (res?.statusCode == 200) {
                    Navigator.pushReplacementNamed(context, "/home");
                  } else if (res?.statusCode == 202) {
                    Navigator.pushReplacementNamed(context, "/edit-profile");
                  } else {
                    String message = res != null ? jsonDecode(res.body) : "Lỗi";

                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(message)),
                    );
                  }
                },
                child: const Text(
                  "Đăng nhập Google",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}

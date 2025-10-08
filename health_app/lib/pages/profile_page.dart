import 'package:flutter/material.dart';
import 'package:health_app/consts.dart';
import 'package:health_app/models/metrics.dart';
import 'package:health_app/models/user.dart';
import 'package:health_app/services/auth_services.dart';
import 'package:health_app/services/user_services.dart';
import 'package:health_app/widgets/custom_footer.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final int index = 3;
  User? user;
  Metrics? latestRecord;

  void initState() {
    super.initState();
    // Gọi hàm lấy thông tin người dùng khi trang được tải
    _loadUserProfile();
  }

  void _loadUserProfile() async {
    try {
      final profile = await userServices().profile();

      if (profile != null) {
        print(profile);
        setState(() {
          user = profile;
          latestRecord = user?.getLatestRecord();
        });
      } else {
        print('Không thể tải thông tin người dùng');
      }
    } catch (e) {
      print('Lỗi khi tải thông tin người dùng: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.superLightGray,
        title: const Text("Hồ sơ"),
        centerTitle: true,
      ),
      body: _buildUI(),
      bottomNavigationBar: CustomFooter(
        curIdx: index,
      ),
    );
  }

  Widget _buildUI() {
    return SafeArea(
      // child: SingleChildScrollView( // Đảm bảo cuộn được khi không đủ không gian
      child: Container(
        padding: const EdgeInsets.fromLTRB(0, 20, 0, 0),
        decoration: const BoxDecoration(
          color: AppColors.superLightGray,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment:
                MainAxisAlignment.spaceBetween, // Căn chỉnh lại cho hợp lý
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                color: Colors.white,
                child: Column(
                  children: [
                    _buildProfileField("Tên", user?.fullName ?? "Họ và tên"),
                    _buildProfileField(
                        "Giới tính", user?.gender == 'male' ? "Nam" : "Nữ"),
                    _buildProfileField(
                        "Chủng tộc", user?.race == 'asian' ? "Phương đông" : "Phương tây"),
                    _buildProfileField(
                        "Ngày sinh",
                        user?.dateOfBirth != null
                            ? "${user!.dateOfBirth!.day.toString().padLeft(2, '0')}/${user!.dateOfBirth!.month.toString().padLeft(2, '0')}/${user!.dateOfBirth!.year}"
                            : ""),
                    _buildProfileField("Chiều cao (cm)",
                        latestRecord?.height?.toString() ?? ""),
                    _buildProfileField("Cân nặng (kg)",
                        latestRecord?.weight?.toString() ?? ""),
                    _buildProfileField("Mức độ hoạt động",
                        user?.activityFactor?.toString() ?? ""),
                    const SizedBox(height: 30),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        fixedSize: const Size(250, 50),
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.black,
                        side: const BorderSide(
                          color: Colors.black,
                          width: 2,
                        ),
                      ),
                      onPressed: () {
                        Navigator.pushNamed(context, '/edit-profile');
                      },
                      child: const Text(
                        "Chỉnh sửa",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        fixedSize: const Size(250, 50),
                        backgroundColor: Color(0xffdc3545),
                      ),
                      onPressed: () {
                        AuthServices().logout();
                        Navigator.pushReplacementNamed(context, '/login');
                      },
                      child: const Text(
                        "Đăng xuất",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      // ),
    );
  }

  Widget _buildProfileField(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(10.0),
      height: 60,
      decoration: const BoxDecoration(
        border: Border(
          top: BorderSide(
            color: AppColors.lightGray,
            width: 1,
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w500,
              color: AppColors.boldGray,
            ),
          ),
        ],
      ),
    );
  }
}

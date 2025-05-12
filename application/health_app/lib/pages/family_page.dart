import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:health_app/consts.dart';
import 'package:health_app/models/group.dart';
import 'package:health_app/models/user.dart';
import 'package:health_app/services/group_services.dart';
import 'package:health_app/services/user_services.dart';
import 'package:health_app/widgets/custom_footer.dart';

class FamilyPage extends StatefulWidget {
  const FamilyPage({super.key});

  @override
  State<FamilyPage> createState() => _FamilyPageState();
}

class _FamilyPageState extends State<FamilyPage> {
  final int index = 1;
  bool _isLoading = true;
  User? user;
  Group? userGroup;
  List<dynamic>? members;

  @override
  void initState() {
    super.initState();
    _loadInfo();
  }

  void _loadInfo() async {
    try {
      final profile = await userServices().profile();
      final group = await groupServices().getUserGroup();
      final users = await groupServices().getMembers();
      if (profile != null) {
        setState(() {
          user = profile;
        });
      } else {
        print("Không thể tải thông tin người dùng");
      }
      if (group != null) {
        setState(() {
          userGroup = group;
        });
      } else {
        print("Không thể tải thông tin nhóm");
      }

      if (users != null) {
        setState(() {
          members = users;
        });
      } else {
        print("Không thể tải thông tin nhóm");
      }
    } catch (e) {
      print('Lỗi khi tải thông tin: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Text(userGroup?.name ?? "Gia đình"),
        centerTitle: true,
      ),
      body: userGroup == null
          ? _isLoading
              ? Center(
                  child:
                      CircularProgressIndicator()) // Hiển thị loading khi đang chờ dữ liệu
              : _buildUIWithoutGroup()
          : _buildUIWithGroup(),
      bottomNavigationBar: CustomFooter(
        curIdx: index,
      ),
    );
  }

  Widget _buildUIWithoutGroup() {
    return Container(
      width: double.infinity,
      height: double.infinity,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              fixedSize: Size(250, 50),
              backgroundColor: AppColors.mainColor,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              Navigator.pushNamed(context, "/create-group");
            },
            child: const Text(
              "Tạo",
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ),
          const SizedBox(
            height: 20,
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              fixedSize: Size(250, 50),
              backgroundColor: Colors.white,
              foregroundColor: Colors.black,
              side: const BorderSide(
                color: Colors.black,
                width: 2,
              ),
            ),
            onPressed: () {
              Navigator.pushNamed(context, "/join-group");
            },
            child: const Text(
              "Tham gia",
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildUIWithGroup() {
    return Column(
      children: [
        Expanded(
          child: Container(
              padding: const EdgeInsets.fromLTRB(15, 10, 10, 0),
              decoration: const BoxDecoration(
                color: AppColors.superLightGray,
              ),
              child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(0, 10, 0, 0),
                  itemCount: members?.length ?? 0,
                  itemBuilder: (context, index) {
                    final member = members![index];
                    return _inforCard(member['fullName'] ?? member['username'],
                        member['isOwner'], member['id']);
                  })),
        ),
        Container(
          width: double.infinity,
          color: AppColors.superLightGray,
          padding: const EdgeInsets.all(10.0),
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              fixedSize: Size(250, 50),
              backgroundColor: Colors.orange,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              bool isLeave = await groupServices().leave();
              if (isLeave) {
                setState(() {
                  userGroup = null;
                });
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text("Thất bại")),
                );
              }
            },
            child: const Text(
              "Rời nhóm",
              style: TextStyle(fontSize: 18),
            ),
          ),
        ),
        (user?.id == userGroup?.owner)
            ? Container(
                width: double.infinity,
                color: AppColors.superLightGray,
                padding: const EdgeInsets.all(10.0),
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    fixedSize: Size(250, 50),
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                  ),
                  onPressed: () async {
                    bool res = await groupServices().deleteGroup();
                    String message;
                    if (res == true) {
                      message = "Xóa nhóm thành công";
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(message)),
                      );
                      Navigator.pushNamedAndRemoveUntil(
                          context, '/family', (route) => false);
                    } else {
                      message = "Xóa nhóm thất bại";
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(message)),
                      );
                    }
                  },
                  child: const Text(
                    "Xóa nhóm",
                    style: TextStyle(fontSize: 18),
                  ),
                ),
              )
            : const SizedBox(),
      ],
    );
  }

  Widget _inforCard(String name, bool isOwner, int memberId) {
    return InkWell(
      onTap: () {
        if (user?.id == memberId) {
          Navigator.pushReplacementNamed(context, '/home');
        } else {
          Navigator.pushNamed(context, '/member-metrics',
              arguments: {"memberId": memberId});
        }
      },
      child: Container(
        width: double.infinity,
        height: 100,
        margin: const EdgeInsets.only(top: 10),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.5), // Màu bóng với độ trong suốt
              spreadRadius: 5, // Độ lan của bóng
              blurRadius: 10, // Độ mờ của bóng
              offset: const Offset(4, 4), // Độ lệch của bóng (x, y)
            )
          ],
        ),
        child: Center(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(
                    Icons.person,
                    color: AppColors.mainColor,
                    size: 32,
                  ),
                  const SizedBox(width: 5),
                  SizedBox(
                    width: 130,
                    child: Text(
                      name,
                      style: const TextStyle(
                        color: AppColors.mainColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                      softWrap: true,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  Text(
                    isOwner ? "Trưởng nhóm" : "Thành viên",
                    style: TextStyle(color: AppColors.appGreen, fontSize: 15),
                  ),
                  const Icon(
                    Icons.arrow_forward_ios,
                    size: 15,
                    color: Colors.grey,
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:health_app/consts.dart';

class CustomFooter extends StatelessWidget {
  final int curIdx;

  const CustomFooter({Key? key, required this.curIdx}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    void onItemTapped(int index) {
      if (index != curIdx) {
        String route;
        switch (index) {
          case 0:
            route = '/home';
            break;
          case 1:
            route = '/family';
            break;
          case 2:
            route = '/qr-scan';
            break;
          case 3:
            route = '/profile';
            break;
          default:
            return;
        }
        Navigator.pushNamedAndRemoveUntil(context, route, (Route<dynamic> route) => false);
      }
    }

    return Container(
      decoration: const BoxDecoration(
        border: Border(
          top: BorderSide(color: AppColors.lightGray),
        ),
      ),
      height: 80,
      child: BottomNavigationBar(
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.house),
            label: 'Trang chủ',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people),
            label: 'Gia đình',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.qr_code_scanner),
            label: 'QR',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Hồ sơ',
          ),
        ],
        iconSize: 40,
        selectedItemColor: AppColors.mainColor,
        unselectedItemColor: AppColors.boldGray,
        backgroundColor: AppColors.superLightGray,
        currentIndex: curIdx,
        onTap: onItemTapped,
      ),
    );
  }
}

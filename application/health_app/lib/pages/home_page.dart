import 'package:flutter/material.dart';
import 'package:health_app/consts.dart';
// import 'package:health_app/models/metrics.dart';
import 'package:health_app/models/user.dart';
// import 'package:health_app/pages/ble_page.dart';
import 'package:health_app/services/user_services.dart';
import 'package:health_app/widgets/custom_footer.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final int index = 0;
  User? user;
  DateTime? latestDate;
  List<dynamic>? latestRecord;



  @override
  void initState() {
    super.initState();
    // Gọi hàm lấy thông tin người dùng khi trang được tải
    _loadUserProfile();
  }

  int? calculateAge(DateTime? dateOfBirth) {
    if (dateOfBirth == null) return null; // Kiểm tra nếu ngày sinh null
    DateTime now = DateTime.now();
    int age = now.year - dateOfBirth.year;

    // Kiểm tra nếu chưa đến sinh nhật năm nay thì trừ đi 1 tuổi
    if (now.month < dateOfBirth.month ||
        (now.month == dateOfBirth.month && now.day < dateOfBirth.day)) {
      age--;
    }

    return age;
  }

  Widget buildMetricWidget(String key) {
    final weightRecord = latestRecord?.firstWhere(
      (record) => record['key'] == key,
      orElse: () => null, // Tránh lỗi nếu không tìm thấy
    );

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          weightRecord != null ? "${weightRecord['value']}" : "",
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(
          width: 10,
        ),
        Text(
          (weightRecord != null && weightRecord['key'] != 'bmi')
              ? "${weightRecord['unit']}"
              : "BMI",
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.mediumGray,
          ),
        ),
      ],
    );
  }

  // Hàm lấy thông tin người dùng
  void _loadUserProfile() async {
    try {
      final profile = await userServices().profile();
      final res = await userServices().getLatestRecord(null);

      if (profile != null) {
        setState(() {
          user = profile;
        });
        if (res != null) {
          latestRecord = res;
          final dateRecord = latestRecord?.firstWhere(
              (record) => record['key'] == 'date',
              orElse: () => null);
          latestDate = dateRecord != null
              ? DateTime.tryParse(dateRecord['value'])
              : null;
        }
      } else {
        print('Không thể tải thông tin người dùng');
      }
    } catch (e) {
      print('Lỗi khi tải thông tin người dùng: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return Scaffold(
      appBar: AppBar(
          backgroundColor: AppColors.superLightGray,
          title: const Text(
            "Trang chủ",
          ),
          centerTitle: true,
          actions: [
            IconButton(
              onPressed: () {
                print("pressed");
              },
              icon: const Icon(
                Icons.smart_toy,
                size: 40,
                color: AppColors.mainColor,
              ),
            ),
          ]),
      body: _buildUI(),
      bottomNavigationBar: CustomFooter(
        curIdx: index,
      ),
    );
  }

  Widget _buildUI() {
    return Stack(
      children: [
        // Nội dung chính
        Container(
            padding: const EdgeInsets.fromLTRB(15, 10, 15, 0),
            decoration: const BoxDecoration(
              color: AppColors.superLightGray,
            ),
            child: Column(
              children: [
                _overviewCard(),
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(0, 10, 0, 0),
                    itemCount: latestRecord?.length ?? 0,
                    itemBuilder: (context, index) {
                      final record = latestRecord![index];
                      if (record['key'] != 'date' &&
                          record['key'] != '_id' &&
                          record['key'] != 'age' &&
                          record['value'] != null) {
                        return _infoCard(record['key'], record['name'],
                            record['value'], record['unit'] ?? '', latestDate);
                      }
                      return const SizedBox();
                    },
                  ),
                ),
              ],
            )),
        // Nút nổi
        // Positioned(
        //   bottom: 20, // Khoảng cách từ cạnh dưới
        //   right: 20, // Khoảng cách từ cạnh phải
        //   child: FloatingActionButton(
        //     onPressed: () {
        //       // Hành động khi nhấn nút
        //       Navigator.pushNamed(context, "/ble-screen");
        //     },
        //     backgroundColor: AppColors.mainColor, // Màu nền nút
        //     foregroundColor: Colors.white, // Màu biểu tượng
        //     child: const Icon(
        //       Icons.monitor_weight,
        //       size: 40,
        //     ), // Biểu tượng trên nút
        //   ),
        // ),
      ],
    );
  }

  Widget _overviewCard() {
    return Container(
        width: double.infinity,
        height: 220,
        margin: const EdgeInsets.only(top: 10),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.subColor,
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
        child: Row(
          children: [
            Expanded(
              child: Column(
                children: [
                  const Row(
                    children: [
                      const Icon(
                        Icons.pie_chart_rounded,
                        color: Colors.white,
                        size: 36,
                      ),
                      const Text(
                        "Tổng quan",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                        ),
                      )
                    ],
                  ),
                  Container(
                    width: double.infinity,
                    height: 140,
                    margin: EdgeInsets.only(top: 20),
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10)),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          user?.overviewScore?.toString() ?? 'None',
                          style: const TextStyle(
                              color: AppColors.boldGray,
                              fontSize: 42,
                              fontWeight: FontWeight.bold),
                        ),
                        const Text(
                          "Giá trị",
                          style: TextStyle(
                            color: AppColors.appGreen,
                            fontSize: 20,
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(
              width: 16,
            ),
            Expanded(
                child: Column(
              children: [
                Container(
                  width: double.infinity,
                  height: 95,
                  decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10)),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    // crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user?.gender == 'male' ? 'Nam' : "Nữ",
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        user?.dateOfBirth != null
                            ? "${calculateAge(user?.dateOfBirth)} Tuổi"
                            : "Không có ngày sinh",
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(
                  height: 10,
                ),
                Container(
                  width: double.infinity,
                  height: 95,
                  decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10)),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      buildMetricWidget('weight'),
                      buildMetricWidget('height'),
                      buildMetricWidget('bmi'),
                    ],
                  ),
                )
              ],
            )),
          ],
        ));
  }

  Widget _infoCard(
      String key, String name, dynamic value, String? unit, DateTime? date) {
    return InkWell(
      onTap: () {
        // Navigator.pushNamed(
        //   context,
        //   '/detail',
        //   arguments: {
        //     "metric": key,
        //   },
        Navigator.pushNamed(
          context,
          '/metric-detail',
          arguments: {
            "metric": key,
          },
        );
      },
      child: Container(
        width: double.infinity,
        height: 180,
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
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Flexible(
                    // Wrap the first Row
                    child: Row(
                      children: [
                        const Icon(
                          Icons.accessibility,
                          color: AppColors.mainColor,
                          size: 32,
                        ),
                        const SizedBox(width: 5),
                        Flexible(
                          // Let the Text adapt to available space
                          child: Text(
                            name,
                            style: const TextStyle(
                              color: AppColors.mainColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 22,
                            ),
                            softWrap: true,
                            overflow: TextOverflow.ellipsis, // Prevent overflow
                          ),
                        ),
                      ],
                    ),
                  ),
                  Row(
                    children: [
                      Text(
                        latestDate != null
                            ? "${latestDate!.day.toString().padLeft(2, '0')}/${latestDate!.month.toString().padLeft(2, '0')}/${latestDate!.year}"
                            : "",
                        style: const TextStyle(
                          color: AppColors.boldGray,
                          fontSize: 20,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      const Icon(
                        Icons.arrow_forward_ios,
                        size: 20,
                        color: Colors.grey,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Giá trị",
                        style: TextStyle(
                          color: AppColors.appGreen,
                          fontSize: 20,
                        ),
                      ),
                      Row(
                        children: [
                          Text(
                            value.toString(),
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(
                            width: 15,
                          ),
                          Text(
                            unit ?? "",
                            style: const TextStyle(
                              fontSize: 20,
                              color: AppColors.mediumGray,
                            ),
                          ),
                        ],
                      )
                    ],
                  ),
                  const Column(
                    children: [
                      Icon(
                        Icons.bar_chart,
                        size: 80,
                      )
                    ],
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}

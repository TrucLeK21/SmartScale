import 'package:flutter/material.dart';
import 'package:health_app/consts.dart';
import 'package:health_app/models/user.dart';
import 'package:health_app/services/user_services.dart';
import 'package:health_app/widgets/custom_footer.dart';

class MemberMetricsPage extends StatefulWidget {
  const MemberMetricsPage({super.key});

  @override
  State<MemberMetricsPage> createState() => _MemberMetricsPageState();
}

class _MemberMetricsPageState extends State<MemberMetricsPage> {
  final int index = 1;
  User? _member;
  List<dynamic>? latestRecord;
  DateTime? latestDate;

  @override
  void initState() {
    super.initState();
    // Gọi hàm lấy thông tin người dùng khi trang được tải
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  void _loadData() async {
    final modalRoute = ModalRoute.of(context);
    if (modalRoute != null) {
      final arguments = modalRoute.settings.arguments as Map?;
      if (arguments != null) {
        final memberId = arguments['memberId'];
        final memberProfile = await userServices().getMemberInfo(memberId);
        final record;
        if (memberProfile != null) {
          setState(() {
            _member = memberProfile;
          });
        }
        if (memberId != null) {
          record = await userServices().getLatestRecord(memberId);
        }
        else record = null;

        if(record != null) {
          setState(() {
            latestRecord = record;
          });

          final dateRecord = latestRecord?.firstWhere(
              (record) => record['key'] == 'date',
              orElse: () => null);
          latestDate = dateRecord != null
              ? DateTime.tryParse(dateRecord['value'])
              : null;
        }
      } else {
        print('No arguments found');
      }
    } else {
      print('No ModalRoute found');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.superLightGray,
        title: Text(
          _member?.fullName ?? _member?.username ?? "",
        ),
        centerTitle: true,
      ),
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
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(0, 10, 0, 0),
              itemCount: latestRecord?.length ?? 0,
              itemBuilder: (context, index) {
                final record = latestRecord![index];
                if (record['key'] != 'date' &&
                    record['key'] != '_id' &&
                    record['key'] != 'age') {
                  return _infoCard(record['key'], record['name'],
                      record['value'], record['unit'] ?? '', latestDate);
                }
                return const SizedBox();
              },
            )),
      ],
    );
  }

  Widget _infoCard(
      String key, String name, dynamic value, String? unit, DateTime? date) {
    return InkWell(
      onTap: () {
        Navigator.pushNamed(
          context,
          '/metric-detail',
          arguments: {
            "metric": key,
            "userId": _member?.id,
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
                  Flexible (
                    child: Row(
                      children: [
                        const Icon(
                          Icons.accessibility,
                          color: AppColors.mainColor,
                          size: 32,
                        ),
                        const SizedBox(width: 5),
                          Flexible(
                            child: Text(
                              name,
                              style: const TextStyle(
                                color: AppColors.mainColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 22,
                              ),
                              softWrap: true,
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

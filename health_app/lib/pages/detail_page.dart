// import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:health_app/consts.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:health_app/services/user_services.dart';
import 'package:health_app/widgets/custom_footer.dart';
import 'package:intl/intl.dart';

class DetailPage extends StatefulWidget {
  const DetailPage({super.key});

  @override
  State<DetailPage> createState() => _DetailPageState();
}

// test
class _DetailPageState extends State<DetailPage> {
  final int index = 0;
  List<dynamic> records = [];
  DateTime? _selectedRecordDate;
  String _selectedRecord = "";
  String _metricUnit = "";
  String _formattedDate = "";
  int? memId;

  @override
  void initState() {
    super.initState();
    // Gọi hàm lấy thông tin người dùng khi trang được tải
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadMetricRecords();
    });
  }

  void _loadMetricRecords() async {
    final modalRoute = ModalRoute.of(context);
    if (modalRoute != null) {
      final arguments = modalRoute.settings.arguments as Map?;
      if (arguments != null) {
        final metric = arguments['metric'];
        memId = arguments['userId'];

        final res = await userServices().getMetricRecords(metric, memId);
        if (res != null && res.isNotEmpty) {
          setState(() {
            records = res;
            _metricUnit = res[0]['unit'] ?? "";
            _selectedRecord = res.last['value'].toString();
            _selectedRecordDate = DateTime.parse(res.last['date']);
            _formattedDate = DateFormat('hh:mm - dd/MM/yyyy')
                .format(_selectedRecordDate!.toLocal());
          });
        } else {
          print("Cannot load metrics");
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
    // TODO: implement build
    if (records.isEmpty) {
      return const Center(
        child:
            CircularProgressIndicator(), // Hiển thị vòng xoay khi chưa có dữ liệu
      );
    }
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Column(children: [
          memId != null ? Text("Chi tiết thành viên") : Text("Chi tiết"),
          Text(
            // "Lúc ${_selectedRecordDate?.hour.toString().padLeft(2, '0')}:${_selectedRecordDate?.minute.toString().padLeft(2, '0')} - ${_selectedRecordDate?.day.toString().padLeft(2, '0')}/${_selectedRecordDate?.month.toString().padLeft(2, '0')}/${_selectedRecordDate?.year.toString()}",
            "Lúc ${_formattedDate}",
            style: const TextStyle(
              fontSize: 18,
              color: Colors.black,
              fontWeight: FontWeight.w300,
            ),
          )
        ]),
        centerTitle: true,
      ),
      body: _buildUI(),
      bottomNavigationBar: CustomFooter(
        curIdx: index,
      ),
    );
  }

  Widget _buildUI() {
    // tính toán các thông số cần dùng

    // tính giá tri trung bình
    double total = 0;
    for (var record in records) {
      total += record['value'];
    }
    double average = total / records.length;

    double minValue = records
        .map((record) => record['value'].toDouble())
        .reduce((a, b) => a < b ? a : b);
    double maxValue = records
        .map((record) => record['value'].toDouble())
        .reduce((a, b) => a > b ? a : b);
    double minToAverage = (minValue + average) / 2;
    double maxToAverage = (maxValue + average) / 2;

    List<double> importantMarks = [
      minValue,
      minToAverage,
      average,
      maxToAverage,
      maxValue
    ];
    List<Color> gradientColors = [
      Colors.green.withOpacity(0.5),
      Colors.blue.withOpacity(0.5)
    ];

    // lấy các điểm

    List<FlSpot> spots = [];
    for (int i = 0; i < records.length; i++) {
      print(records[i]['value'].runtimeType);
      spots.add(FlSpot(i.toDouble(), records[i]['value'].toDouble()));
    }

    return Container(
      child: Column(
        children: [
          //Represent Data
          Container(
            width: double.infinity,
            height: 200,
            color: Colors.white,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  // crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Baseline(
                      baseline: 64,
                      baselineType: TextBaseline.alphabetic,
                      child: Text(
                        _selectedRecord,
                        style: TextStyle(
                          fontSize: 64,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    SizedBox(
                      width: 15,
                    ),
                    Baseline(
                      baseline: 48,
                      baselineType: TextBaseline.alphabetic,
                      child: Text(
                        _metricUnit,
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w400,
                          color: AppColors.boldGray,
                        ),
                      ),
                    )
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "tiêu chuẩn",
                      style: TextStyle(
                        color: AppColors.appGreen,
                        fontSize: 24,
                      ),
                    )
                  ],
                )
              ],
            ),
          ),
          // Represent chart
          Container(
            width: double.infinity,
            height: 250,
            color: Colors.white,
            padding: const EdgeInsets.all(20),
            child: LineChart(
              LineChartData(
                extraLinesData: ExtraLinesData(horizontalLines: [
                  HorizontalLine(
                    y: 1, // Min value
                    color: Colors.red,
                    strokeWidth: 2,
                    dashArray: [5, 5],
                  ),
                  HorizontalLine(
                    y: 5, // Max value
                    color: Colors.green,
                    strokeWidth: 2,
                    dashArray: [5, 5],
                  ),
                  HorizontalLine(
                    y: 3, // Average value
                    color: Colors.orange,
                    strokeWidth: 2,
                    dashArray: [5, 5],
                  ),
                ]),
                titlesData: FlTitlesData(
                  show: true,
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 40,
                      getTitlesWidget: (value, meta) {
                        //Kiểm tra xem 'value' có nằm gần một trong các cột mốc không
                        if (importantMarks
                            .any((mark) => (value - mark).abs() < 0.25)) {
                          return Container(
                            margin: const EdgeInsets.only(right: 5),
                            child: Text(
                              value.toStringAsFixed(
                                  0), // Hiển thị 1 chữ số thập phân
                              style: TextStyle(
                                color: Colors.black,
                                fontSize: 12,
                              ),
                            ),
                          );
                        }
                        return Container();
                      },
                      interval: null,
                    ),
                  ),
                  rightTitles: const AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: false,
                    ),
                  ),
                  topTitles: const AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: false,
                    ),
                  ),
                  bottomTitles: const AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: false,
                    ),
                  ),
                ),
                borderData: FlBorderData(
                  show: false,
                ),
                gridData: const FlGridData(
                  show: false,
                ),
                lineBarsData: [
                  LineChartBarData(
                    spots: spots,
                    dotData: FlDotData(
                        show: true,
                        getDotPainter: (spot, percent, barData, index) {
                          return FlDotCirclePainter(
                            radius: 3,
                            color: Colors.green,
                            strokeWidth: 0,
                            strokeColor: Colors.green.shade300,
                          );
                        }),
                    color: AppColors.appGreen,
                    belowBarData: BarAreaData(
                      show: true,
                      gradient: LinearGradient(
                        colors: [gradientColors[0], gradientColors[1]],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ],
                lineTouchData: LineTouchData(
                  touchCallback:
                      (FlTouchEvent event, LineTouchResponse? touchResponse) {
                    if (!event.isInterestedForInteractions ||
                        touchResponse == null ||
                        touchResponse.lineBarSpots == null) {
                      return;
                    }
                    final touchedSpot = touchResponse.lineBarSpots!.first;
                    setState(() {
                      _selectedRecord = touchedSpot.y.toString();
                      _selectedRecordDate = DateTime.parse(
                          records[touchedSpot.x.toInt()]['date']);
                      _formattedDate = DateFormat('hh:mm - dd/MM/yyyy')
                          .format(_selectedRecordDate!.toLocal());
                    });
                  },
                ),
                minY: minValue,
                maxY: maxValue,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

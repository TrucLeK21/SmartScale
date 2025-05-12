import 'package:flutter/material.dart';
import 'package:health_app/consts.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:health_app/services/user_services.dart';
import 'package:health_app/widgets/custom_footer.dart';
import 'package:intl/intl.dart';

class MetricDetailPage extends StatefulWidget {
  const MetricDetailPage({super.key});

  @override
  State<MetricDetailPage> createState() => _MetricDetailPageState();
}

class _MetricDetailPageState extends State<MetricDetailPage> {
  final int index = 0;
  List<dynamic> records = [];
  DateTime? _selectedRecordDate;
  String _previousRecordDate = "";
  LineBarSpot? _selectedSpot;
  String _selectedRecord = "";
  double? _metricDiff;
  String _metricUnit = "";
  String _formattedDate = "";
  String _fromDate = "";
  String _toDate = "";
  int? memId;
  List<FlSpot> spots = [];
  bool touchingGraph = false;

  late TransformationController _transformationController;
  bool _isPanEnabled = true;
  bool _isScaleEnabled = true;

  @override
  void initState() {
    _transformationController = TransformationController();
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
            _metricDiff = res.length >= 2
                ? (res.last['value'] as num).toDouble() -
                    (res[res.length - 2]['value'] as num).toDouble()
                : null;
            _selectedRecordDate = DateTime.parse(res.last['date']);
            _previousRecordDate =
                DateFormat('dd/MM').format( DateTime.parse(res[res.length-2]['date']).toLocal());
            _formattedDate = DateFormat('hh:mm - dd/MM/yyyy')
                .format(_selectedRecordDate!.toLocal());
            _fromDate = DateFormat('dd/MM/yyyy')
                .format(DateTime.parse(res.first['date']));
            _toDate = DateFormat('dd/MM/yyyy')
                .format(DateTime.parse(res.last['date']));
          });
          for (int i = 0; i < records.length; i++) {
            spots.add(FlSpot(i.toDouble(), records[i]['value'].toDouble()));
          }

          setState(() {
            _selectedSpot = LineBarSpot(
              LineChartBarData(
                  spots: spots), // Bar data giả lập, không ảnh hưởng biểu đồ
              records.length - 1, // Chỉ mục của điểm cuối cùng
              FlSpot((records.length - 1).toDouble(),
                  records.last['value'].toDouble()),
            );
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
      bottomNavigationBar: CustomFooter(curIdx: index),
    );
  }

  Widget _buildUI() {
    // lấy các điểm

    const leftReservedSize = 52.0;
    return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        spacing: 16,
        children: [
          LayoutBuilder(builder: (context, constraints) {
            final width = constraints.maxWidth;
            return width >= 380
                ? Row(
                    children: [
                      const SizedBox(width: leftReservedSize),
                      _ChartTitle(),
                      const Spacer(),
                      Center(
                        child: _TransformationButtons(
                          controller: _transformationController,
                        ),
                      ),
                    ],
                  )
                : Column(
                    children: [
                      _ChartTitle(),
                      const SizedBox(height: 16),
                      _TransformationButtons(
                        controller: _transformationController,
                      ),
                    ],
                  );
          }),
          // Padding(
          //   padding: const EdgeInsets.symmetric(horizontal: 16.0),
          //   child: Row(
          //     mainAxisAlignment: MainAxisAlignment.end,
          //     spacing: 16,
          //     children: [
          //       const Text('Pan'),
          //       Switch(
          //         value: _isPanEnabled,
          //         onChanged: (value) {
          //           setState(() {
          //             _isPanEnabled = value;
          //           });
          //         },
          //       ),
          //       const Text('Scale'),
          //       Switch(
          //         value: _isScaleEnabled,
          //         onChanged: (value) {
          //           setState(() {
          //             _isScaleEnabled = value;
          //           });
          //         },
          //       ),
          //     ],
          //   ),
          // ),
          AspectRatio(
            aspectRatio: 1.4,
            child: Padding(
              padding: const EdgeInsets.only(
                top: 0.0,
                right: 18.0,
              ),
              child: LineChart(
                transformationConfig: FlTransformationConfig(
                  scaleAxis: FlScaleAxis.horizontal,
                  minScale: 1.0,
                  maxScale: 25.0,
                  panEnabled: _isPanEnabled,
                  scaleEnabled: _isScaleEnabled,
                  transformationController: _transformationController,
                ),
                LineChartData(
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
                      barWidth: 1,
                      shadow: const Shadow(
                        color: AppColors.appGreen,
                        blurRadius: 2,
                      ),
                      belowBarData: BarAreaData(
                        show: true,
                        gradient: LinearGradient(
                          colors: [
                            AppColors.appGreen.withValues(alpha: 0.2),
                            AppColors.appGreen.withValues(alpha: 0.0),
                          ],
                          stops: const [0.5, 1.0],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                      showingIndicators: _selectedSpot != null
                          ? [_selectedSpot!.spotIndex]
                          : [],
                    )
                  ],
                  lineTouchData: LineTouchData(
                    enabled: touchingGraph,
                    touchSpotThreshold: 15,
                    getTouchLineStart: (_, __) => -double.infinity,
                    getTouchLineEnd: (_, __) => double.infinity,
                    getTouchedSpotIndicator:
                        (LineChartBarData barData, List<int> spotIndexes) {
                      return spotIndexes.map((spotIndex) {
                        return TouchedSpotIndicatorData(
                          const FlLine(
                            color: AppColors.mainColor,
                            strokeWidth: 1.5,
                            dashArray: [8, 2],
                          ),
                          FlDotData(
                            show: true,
                            getDotPainter: (spot, percent, barData, index) {
                              return FlDotCirclePainter(
                                radius: 6,
                                color: AppColors.appGreen,
                                strokeWidth: 0,
                                strokeColor: AppColors.appGreen,
                              );
                            },
                          ),
                        );
                      }).toList();
                    },
                    touchCallback:
                        (FlTouchEvent event, LineTouchResponse? touchResponse) {
                      if (event is FlTapDownEvent ||
                          event is FlPanStartEvent ||
                          event is FlLongPressStart) {
                        // Khi người dùng bắt đầu chạm vào biểu đồ: bật chế độ tương tác.
                        if (!touchingGraph) {
                          setState(() {
                            touchingGraph = true;
                          });
                        }
                      } else if (event is FlTapUpEvent ||
                          event is FlPanEndEvent ||
                          event is FlLongPressEnd) {
                        // Khi người dùng dừng chạm: tắt chế độ tương tác.
                        if (touchingGraph) {
                          setState(() {
                            touchingGraph = false;
                          });
                        }
                      }
                      // Nếu có sự kiện chạm, cập nhật _selectedSpot
                      if (!event.isInterestedForInteractions ||
                          touchResponse == null ||
                          touchResponse.lineBarSpots == null) {
                        return;
                      }

                      setState(() {
                        _selectedSpot = touchResponse.lineBarSpots!.first;
                        // Lấy chỉ số điểm được chọn
                        final int index = _selectedSpot!.x.toInt();

                        // Lấy giá trị điểm hiện tại
                        final currentValue = _selectedSpot!.y;

                        _selectedRecord = _selectedSpot!.y.toString();

                        if (index >= 1) {
                          final previousValue = spots[index - 1].y;
                          _metricDiff = currentValue - previousValue;
                          _previousRecordDate = DateFormat('dd/MM').format(
                              DateTime.parse(records[index - 1]['date'])
                                  .toLocal());
                        } else {
                          _previousRecordDate = "";
                          _metricDiff = null;
                        }

                        _selectedRecordDate =
                            DateTime.parse(records[index]['date']);
                        _formattedDate = DateFormat('hh:mm - dd/MM/yyyy')
                            .format(_selectedRecordDate!.toLocal());
                      });
                    },
                    touchTooltipData: LineTouchTooltipData(
                      getTooltipColor: (LineBarSpot barSpot) =>
                          AppColors.superLightGray,
                      getTooltipItems: (List<LineBarSpot> touchedSpots) {
                        return touchedSpots.map((spot) {
                          return LineTooltipItem(
                            '${spot.y} ${records[0]["unit"]}', // Nội dung tooltip
                            const TextStyle(
                              color: Colors.green, // Màu chữ của tooltip
                              fontWeight: FontWeight.bold,
                            ),
                          );
                        }).toList();
                      },
                    ),
                  ),
                  titlesData: FlTitlesData(
                    show: true,
                    rightTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    leftTitles: const AxisTitles(
                      drawBelowEverything: true,
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: leftReservedSize,
                        maxIncluded: true,
                        minIncluded: false,
                      ),
                    ),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: false,
                        reservedSize: 38,
                        maxIncluded: false,
                        getTitlesWidget: (double value, TitleMeta meta) {
                          final date =
                              DateTime.parse(records[value.toInt()]["date"]);
                          return SideTitleWidget(
                            meta: meta,
                            child: Column(
                              children: [
                                const SizedBox(
                                  height: 5,
                                ),
                                Transform.rotate(
                                  angle: -45 * 3.14 / 180,
                                  child: Text(
                                    '${date.day}/${date.month}',
                                    style: const TextStyle(
                                      color: AppColors.subColor,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ]);
  }

  Widget _ChartTitle() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: 14),
        Text(
          "$_selectedRecord $_metricUnit",
          style: const TextStyle(
            color: AppColors.subColor,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        _metricDiff != null
            ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                    children: [
                      Icon(
                        _metricDiff! >= 0
                            ? Icons.arrow_circle_up
                            : Icons.arrow_circle_down,
                        color: Colors.orangeAccent,
                        size: 16,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        "${_metricDiff!.abs().toStringAsFixed(2)} $_metricUnit",
                        style: const TextStyle(
                           color: Colors.orangeAccent,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                  Text(
                        "So với lần trước (${_previousRecordDate})",
                        style: const TextStyle(
                           color: AppColors.boldGray,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
              ],
            )
            : const SizedBox.shrink(),
        Text(
          "$_fromDate - $_toDate",
          style: const TextStyle(
            color: AppColors.mediumGray,
            fontWeight: FontWeight.bold,
            fontSize: 10,
          ),
        ),
        const SizedBox(height: 14),
      ],
    );
  }

  @override
  void dispose() {
    _transformationController.dispose();
    super.dispose();
  }
}

// class _ChartTitle extends StatelessWidget {
//   const _ChartTitle();

//   @override
//   Widget build(BuildContext context) {
//     return const Column(
//       crossAxisAlignment: CrossAxisAlignment.start,
//       children: [
//         SizedBox(height: 14),
//         Text(
//           'Lịch sử',
//           style: TextStyle(
//             color: Colors.orange,
//             fontWeight: FontWeight.bold,
//             fontSize: 18,
//           ),
//         ),
//         Text(
//           '2023/12/19 - 2024/12/17',
//           style: TextStyle(
//             color: Colors.green,
//             fontWeight: FontWeight.bold,
//             fontSize: 14,
//           ),
//         ),
//         SizedBox(height: 14),
//       ],
//     );
//   }
// }

class _TransformationButtons extends StatelessWidget {
  const _TransformationButtons({
    required this.controller,
  });

  final TransformationController controller;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Tooltip(
          message: 'Zoom in',
          child: IconButton(
            icon: const Icon(
              Icons.add,
              size: 16,
            ),
            onPressed: _transformationZoomIn,
          ),
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Tooltip(
              message: 'Move left',
              child: IconButton(
                icon: const Icon(
                  Icons.arrow_back_ios,
                  size: 16,
                ),
                onPressed: _transformationMoveLeft,
              ),
            ),
            Tooltip(
              message: 'Reset zoom',
              child: IconButton(
                icon: const Icon(
                  Icons.refresh,
                  size: 16,
                ),
                onPressed: _transformationReset,
              ),
            ),
            Tooltip(
              message: 'Move right',
              child: IconButton(
                icon: const Icon(
                  Icons.arrow_forward_ios,
                  size: 16,
                ),
                onPressed: _transformationMoveRight,
              ),
            ),
          ],
        ),
        Tooltip(
          message: 'Zoom out',
          child: IconButton(
            icon: const Icon(
              Icons.minimize,
              size: 16,
            ),
            onPressed: _transformationZoomOut,
          ),
        ),
      ],
    );
  }

  void _transformationReset() {
    controller.value = Matrix4.identity();
  }

  void _transformationZoomIn() {
    controller.value *= Matrix4.diagonal3Values(
      1.1,
      1.1,
      1,
    );
  }

  void _transformationMoveLeft() {
    controller.value *= Matrix4.translationValues(
      20,
      0,
      0,
    );
  }

  void _transformationMoveRight() {
    controller.value *= Matrix4.translationValues(
      -20,
      0,
      0,
    );
  }

  void _transformationZoomOut() {
    controller.value *= Matrix4.diagonal3Values(
      0.9,
      0.9,
      1,
    );
  }
}

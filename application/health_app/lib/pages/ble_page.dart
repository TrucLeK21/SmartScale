import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:health_app/consts.dart';
import 'dart:async';
import 'dart:math';
import 'dart:convert';
import 'package:health_app/models/user.dart';
import 'package:health_app/pages/camera_page.dart';
import 'package:health_app/services/user_services.dart';

class DisplayBodyMetricsScreen extends StatefulWidget {
  final double weight;
  final BluetoothDevice?
      connectedRaspi; // Receive the weight variable from the parent
  final String? initialProgress;

  const DisplayBodyMetricsScreen({
    Key? key,
    required this.weight,
    this.connectedRaspi,
    this.initialProgress,
  }) : super(key: key);

  @override
  DisplayBodyMetricsScreenState createState() =>
      DisplayBodyMetricsScreenState();
}

class DisplayBodyMetricsScreenState extends State<DisplayBodyMetricsScreen> {
  BluetoothDevice? rasPi;
  BluetoothCharacteristic? _writeCharacteristic;
  BluetoothCharacteristic? _readCharacteristic;
  final Guid characteristicUuidPi =
      Guid('00000002-cbd6-4d25-8851-18cb67b7c2d9');
  String progressText = "";
  bool isValid = false;
  List<Map<String, dynamic>> bodyMetrics = [];
  User? user;

  @override
  void initState() {
    super.initState();
    if (widget.initialProgress != null) {
      progressText = widget.initialProgress!;
    }
    _loadUserProfile();
    rasPi = widget.connectedRaspi;
  }

  // Method to update status that can be called from SendImageScreen
  void updateProgress(String progressTxt) {
    print("update Text: $progressTxt");
    setState(() {
      progressText = progressTxt;
    });

    if (progressText == "Image sent successfully!") {
      scanAndConnect();
    }
  }

  // Hàm lấy thông tin người dùng
  void _loadUserProfile() async {
    try {
      final profile = await userServices().profile();

      if (profile != null) {
        setState(() {
          user = profile;
        });
      } else {
        print('Không thể tải thông tin người dùng');
      }
    } catch (e) {
      print('Lỗi khi tải thông tin người dùng: $e');
    }
  }

  void scanAndConnect() async {
    // if the device already connected, discover the characteristic immediately
    if (rasPi?.connectionState.first == BluetoothConnectionState.connected) {
      discoverServices();
    } else {
      // Start scanning
      FlutterBluePlus.startScan(
        timeout: const Duration(seconds: 30),
        withNames: ["Weight Scale"],
      );

      // Listen to scan results
      FlutterBluePlus.scanResults.listen((results) async {
        for (ScanResult result in results) {
          if (result.device.platformName == "Weight Scale") {
            // Replace with your BLE server name
            FlutterBluePlus.stopScan();
            setState(() {
              rasPi = result.device;
            });

            // Connect to the device
            await rasPi!.connect();
            discoverServices();
            break;
          }
        }
      });
    }
  }

  void discoverServices() async {
    if (rasPi == null) return;

    List<BluetoothService> services = await rasPi!.discoverServices();
    for (BluetoothService service in services) {
      for (BluetoothCharacteristic characteristic in service.characteristics) {
        if (characteristic.uuid == characteristicUuidPi) {
          print('Found characteristic with UUID: ${characteristic.uuid}');
          if (characteristic.properties.write) {
            setState(
              () {
                _writeCharacteristic = characteristic;
              },
            );
          }
          if (characteristic.properties.read) {
            setState(
              () {
                _readCharacteristic = characteristic;
              },
            );
          }

          if (_writeCharacteristic != null && _readCharacteristic != null) {
            // start writing data as soon as both read & write are available
            writeData();
          }
        }
      }
    }
  }

  void writeData() async {
    if (_writeCharacteristic != null) {
      setState(() {
        progressText = "Sending data...";
      });

      final data = {"id": user?.id, "weight": widget.weight};

      String string_data = jsonEncode(data);

      await _writeCharacteristic!.write(string_data.toString().codeUnits);
      startPeriodicReading(string_data);
      print("Data written: ${data}");
    } else {
      print("Write characteristic not found.");
    }
  }

  void startPeriodicReading(final data) async {
    const duration = Duration(milliseconds: 400);
    final startTime = DateTime.now();

    setState(() {
      progressText = "Waiting for response...";
    });

    Timer.periodic(duration, (timer) async {
      // Stop after 20 seconds
      if (DateTime.now().difference(startTime).inSeconds >= 10) {
        timer.cancel();
        if (!isValid) {
          setState(() {
            progressText = "Error: No valid data received.";
          });
        }
        return;
      }

      // Wait for a moment before reading
      await Future.delayed(const Duration(milliseconds: 400));

      // Read data from the server
      List<int> value = await _readCharacteristic!.read();
      String string_data = String.fromCharCodes(value);
      print("string_data: $string_data");

      // Validate the response
      if (isValidData(string_data)) {
        Map<String, dynamic> data = jsonDecode(string_data);
        listMaker(data);

        print("metric $bodyMetrics");
        timer.cancel();

        // If data is valid (not '[]')
        setState(() {
          isValid = true;
        });
      } else {
        // await _writeCharacteristic!.write(data.toString().codeUnits);

        setState(() {
          progressText = "Error: Invalid data received.";
        });
      }
    });
  }

  bool isValidData(String data) {
    if (data == '[]') {
      return false;
    } else {
      return true;
    }
  }

  void listMaker(Map<String, dynamic> data) {
    bodyMetrics = [
      {"name": "Weight", "value": data['weight'], "unit": "Kg"},
      {"name": "BMI", "value": data['bmi'], "unit": ""},
      {"name": "BMR", "value": data['bmr'], "unit": "kcal/day"},
      {"name": "TDEE", "value": data['tdee'], "unit": "kcal/day"},
      {"name": "LBM", "value": data['lbm'], "unit": "kg"},
      {"name": "Fat %", "value": data['fatPercentage'], "unit": "%"},
      {"name": "Water %", "value": data['waterPercentage'], "unit": "%"},
      {"name": "Bone Mass", "value": data['boneMass'], "unit": "kg"},
      {"name": "Muscle Mass", "value": data['muscleMass'], "unit": "kg"},
      {"name": "Protein %", "value": data['proteinPercentage'], "unit": "%"},
      {"name": "Visceral Fat", "value": data['visceralFat'], "unit": "kg"},
      {"name": "Ideal Weight", "value": data['idealWeight'], "unit": "kg"}
    ];
  }

  @override
  void dispose() {
    rasPi?.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!isValid) {
      return Scaffold(
          body: Container(
        color: Colors.white,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              SizedBox(height: 10),
              RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: '${widget.weight} ', // Weight part
                      style: TextStyle(
                        fontSize: 40,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                    TextSpan(
                      text: 'Kg', // Smaller "Kg"
                      style: TextStyle(
                        fontSize: 20, // Smaller font size for "Kg"
                        fontWeight: FontWeight.normal,
                        color: Colors.black,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 50),
              Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    height: 100,
                    width: 100,
                    child: CircularProgressIndicator(
                      color: Colors.lightBlue,
                    ),
                  ),
                  Image.asset(
                    'assets/img/pi4.png',
                    // fit: BoxFit.cover,
                    width: 70,
                    height: 70,
                  ),
                ],
              ),
              SizedBox(
                height: 20,
              ),
              Text(progressText,
                  style: TextStyle(
                    fontSize: 20,
                    color: Colors.black,
                    fontFamily: 'Roboto',
                  )),
              ElevatedButton(onPressed: scanAndConnect, child: Text("Retry")),
            ],
          ),
        ),
      ));
    } else {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Body Metrics'),
          centerTitle: true,
          leading: IconButton(
            icon: Icon(Icons.arrow_back),
            onPressed: () {
              Navigator.pushNamedAndRemoveUntil(
                context,
                '/home', // The page you want to go back to
                (route) => false, // Remove all routes above the '/home' page
              );
            },
          ),
        ),
        body: ListView.builder(
          padding: const EdgeInsets.all(16.0),
          itemCount: bodyMetrics.length,
          itemBuilder: (context, index) {
            final metric = bodyMetrics[index];
            return Card(
              elevation: 4,
              margin: const EdgeInsets.symmetric(vertical: 8.0),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16.0),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          metric['name'],
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${metric['value']} ${metric['unit']}',
                          style: const TextStyle(
                            fontSize: 16,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                    Icon(
                      Icons.fitness_center,
                      color: Colors.blueAccent,
                      size: 40,
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      );
    }
  }
}

class BlueetoothConnectionScreen extends StatefulWidget {
  const BlueetoothConnectionScreen({super.key});

  @override
  State<BlueetoothConnectionScreen> createState() =>
      _BlueetoothConnectionScreenState();
}

class _BlueetoothConnectionScreenState
    extends State<BlueetoothConnectionScreen> {
  BluetoothDevice? miScale;
  bool _isConnecting = true;
  bool _isConnected = false;
  bool _finishGetingWeight = false;
  double _weight = 0.0;

  final Guid serviceUuid = Guid('0000181d-0000-1000-8000-00805f9b34fb');
  final Guid characteristicUuid = Guid('00002a9d-0000-1000-8000-00805f9b34fb');

  @override
  void initState() {
    startScan();
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
    miScale?.disconnect();
  }

  void startScan() {
    if (!_isConnected) {
      FlutterBluePlus.startScan(
        timeout: const Duration(seconds: 30),
        withNames: ["MI SCALE2"],
      );

      // Set a timer to check if no device is found within the timeout
      Future.delayed(const Duration(seconds: 30), () {
        if (!_isConnected) {
          setState(() {
            _isConnecting = false;

            print("MI SCALE 2 not found.");
            return;
          });
        }
      });

      // Listen to scan results
      FlutterBluePlus.scanResults.listen((results) {
        if (results.isNotEmpty) {
          ScanResult scaleResult = results.last;

          if (scaleResult.device.platformName == "MI SCALE2") {
            print('Device found: ${scaleResult.device.platformName}');
            miScale = scaleResult.device;
            FlutterBluePlus.stopScan();
            connectToDevice(scaleResult.device);

            setState(() {
              _isConnecting = false;
              _isConnected = true;
            });
          }
        }
      });
    }
  }

  Future<void> processReceivedData(List<int> data) async {
    // Extract the weight from the data bytes
    int weightValue = (data[1] | (data[2] << 8));
    double weight = weightValue / 200;

    bool isWeightStable = (data[0] & (1 << 5)) != 0;
    bool isWeightRemoved = (data[0] & (1 << 7)) != 0;

    if (isWeightStable && !isWeightRemoved) {
      try {
        await miScale?.disconnect();
        setState(() {
          _finishGetingWeight = true;
          _weight = weight;
        });
      } catch (e) {
        print('Error connecting to device: $e');
      }
    } else {
      // tell user that weight is removed
    }

    print("Weight: ${weight.toStringAsFixed(2)} kg");
    setState(() {
      _weight = weight;
    });
  }

  Future<void> connectToDevice(BluetoothDevice device) async {
    try {
      await device.connect();
      print('Connected to ${device.platformName}');

      // Discover services and find the specific characteristic
      List<BluetoothService> services = await device.discoverServices();
      for (BluetoothService service in services) {
        for (BluetoothCharacteristic characteristic
            in service.characteristics) {
          if (characteristic.uuid == characteristicUuid) {
            print('Found characteristic with UUID: ${characteristic.uuid}');

            // Read data from the characteristic
            characteristic.setNotifyValue(true);
            characteristic.lastValueStream.listen((value) {
              // Handle received value
              if (value.isNotEmpty) {
                processReceivedData(value);
              } else {
                print('Received empty value list. Skipping dataParser.');
              }
            });
          }
        }
      }
    } catch (e) {
      print('Error connecting to device: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isConnecting) {
      return Scaffold(
          body: Container(
        color: Colors.white,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    height: 100,
                    width: 100,
                    child: CircularProgressIndicator(
                      color: Colors.lightBlue,
                    ),
                  ),
                  Image.asset(
                    'assets/img/miscale2.png',
                    fit: BoxFit.cover,
                    width: 60,
                    height: 60,
                  ),
                ],
              ),
              SizedBox(
                height: 20,
              ),
              Text('Connecting to MI SCALE 2',
                  style: TextStyle(
                    fontSize: 20,
                    color: Colors.black,
                    fontFamily: 'Roboto',
                  )),
              Text(
                'Please step on the scale',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.blueGrey,
                  fontFamily: 'Roboto',
                ),
              ),
            ],
          ),
        ),
      ));
    } else {
      if (_finishGetingWeight) {
        return CameraPage(weight: _weight);
      }

      if (_isConnected) {
        return WeightDisplayScreen(
            weight: _weight); // Navigate to Weight Display screen on success
      } else {
        return const CannotConnectScreen(); // Show error screen if connection failed
      }
    }
  }
}

class CannotConnectScreen extends StatelessWidget {
  const CannotConnectScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text(""),
        centerTitle: true,
      ),
      body: Container(
        color: Colors.white,
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Icon(
                Icons.bluetooth_disabled_rounded,
                size: 50, // Adjust size
                color: Colors.red, // Adjust color
              ),
              SizedBox(
                height: 20,
              ),
              Text('Cannot connect to MI SCALE 2',
                  style: TextStyle(
                    fontSize: 20,
                    color: Colors.black,
                    fontFamily: 'Roboto',
                  )),
              Text('Please try again',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.blueGrey,
                    fontFamily: 'Roboto',
                  )),
              // ElevatedButton(
              //   child: const Text('Retry'),
              // ),
            ],
          ),
        ),
      ),
    );
  }
}

class WeightDisplayScreen extends StatefulWidget {
  final double weight; // Receive the weight variable from the parent

  const WeightDisplayScreen({super.key, required this.weight});

  @override
  _WeightDisplayScreenState createState() => _WeightDisplayScreenState();
}

class _WeightDisplayScreenState extends State<WeightDisplayScreen>
    with SingleTickerProviderStateMixin {
  // Mix in the ticker provider
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    // Initialize the animation controller for spinning effect
    _animationController =
        AnimationController(vsync: this, duration: const Duration(seconds: 3))
          ..repeat(); // Repeats infinitely
  }

  @override
  void dispose() {
    _animationController.dispose(); // Dispose of the animation controller
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Glowing and spinning circle around the weight
            AnimatedBuilder(
              animation: _animationController,
              builder: (context, child) {
                return Stack(
                  alignment: Alignment.center,
                  children: [
                    // Spinning circular progress indicator with a glowing effect
                    Transform.rotate(
                      angle: _animationController.value * 2 * pi,
                      child: Container(
                        width: 200,
                        height: 200,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.blueAccent.withOpacity(0.7),
                            width: 6,
                          ),
                        ),
                        child: CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation<Color>(
                              Colors.blueAccent.withOpacity(0.5)),
                          strokeWidth: 5,
                          backgroundColor: Colors.transparent,
                          value: null,
                        ),
                      ),
                    ),
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: '${widget.weight} ', // Weight part
                            style: TextStyle(
                              fontSize: 40,
                              fontWeight: FontWeight.bold,
                              color: Colors.black,
                            ),
                          ),
                          TextSpan(
                            text: 'Kg', // Smaller "Kg"
                            style: TextStyle(
                              fontSize: 20, // Smaller font size for "Kg"
                              fontWeight: FontWeight.normal,
                              color: Colors.black,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

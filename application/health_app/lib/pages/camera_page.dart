import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:health_app/pages/ble_page.dart';

class CameraPage extends StatefulWidget {
  final double weight;
  const CameraPage({super.key, required this.weight});

  @override
  _CameraPageState createState() => _CameraPageState();
}

class _CameraPageState extends State<CameraPage> {
  late CameraController _controller;
  late List<CameraDescription> _cameras;
  bool _isCameraInitialized = false;
  late CameraDescription _camera;

  BluetoothDevice? rasPi;
  BluetoothCharacteristic? _writeCharacteristic;
  BluetoothCharacteristic? _readCharacteristic;
  final Guid characteristicUuidPi = Guid('00000002-6acc-4ba4-b29c-475d7b407faf');

  // GlobalKey to access the DisplayBodyMetricScreen state
  final GlobalKey<DisplayBodyMetricsScreenState> bodyMetricsKey =
      GlobalKey<DisplayBodyMetricsScreenState>();
  final Color _squaredColor = Colors.red;

  // The square's dimensions and position
  final double squareSize = 200.0;
  final double squareLeft = 100.0;  // Left offset of the square
  final double squareTop = 200.0;   // Top offset of the square

  @override
  void initState() {
    super.initState();
    _initializeCamera();
    scanAndConnect();
  }

  // Initialize the camera
  void _initializeCamera() async {
    _cameras = await availableCameras();
    _camera = _cameras[1];
    _controller = CameraController(
      _camera,
      ResolutionPreset.medium, // Adjust quality as needed
    );

    await _controller.initialize();
    setState(() {
      _isCameraInitialized = true;
    });
  }

  void scanAndConnect() async {
    // if the device already connected, discover the characteristic immediately
    if (rasPi?.connectionState.first == BluetoothConnectionState.connected) {
      discoverServices();
    } else {
      // Start scanning
      FlutterBluePlus.startScan(timeout: const Duration(seconds: 30), withNames: ["Weight Scale"],);

      // Listen to scan results
      FlutterBluePlus.scanResults.listen((results) async {
        for (ScanResult result in results) {
          if (result.device.platformName == "Weight Scale") { // Replace with your BLE server name
            FlutterBluePlus.stopScan();
            rasPi = result.device;

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
            setState(() {
              _writeCharacteristic = characteristic;
            },);
          }
          if (characteristic.properties.read) {
            setState(() {
              _readCharacteristic = characteristic;
            },);
          }
        }
      }
    }
  }

  Future<void> sendViaBluetooth(Uint8List data) async {
    if (_writeCharacteristic != null) {
      sendImageInChunks(_writeCharacteristic, data);
    } else {
      print("Write characteristic not found.");
    }
  }

  Future<void> sendImageInChunks(BluetoothCharacteristic? characteristic, Uint8List imageData) async {
    // Adjust chunk size to be within the Bluetooth MTU limit (509 bytes)
    const int chunkSize = 319;  // Maximum Bluetooth MTU with response
    int totalChunks = (imageData.length / chunkSize).ceil();

    for (int i = 0; i < totalChunks; i++) {
      // Extract the chunk (ensure the chunk size does not exceed the limit)
      int start = i * chunkSize;
      int end = (i + 1) * chunkSize;
      if (end > imageData.length) end = imageData.length;

      Uint8List chunk = imageData.sublist(start, end);

      // Add sequence number and data
      Map<String, dynamic> chunkData = {
        'seq': i,
        'data': base64Encode(chunk), // Encode chunk as base64 for easy transport
      };

      // Convert chunk to JSON
      String jsonChunk = jsonEncode(chunkData);

      // Send the chunk
      await characteristic?.write(jsonChunk.codeUnits, withoutResponse: false);
    }

    // Send EOF chunk to signal end of transmission
    Map<String, dynamic> eofChunk = {
      'seq': totalChunks,
      'data': 'EOF',
    };
    await characteristic?.write(utf8.encode(jsonEncode(eofChunk)), withoutResponse: false);

    bodyMetricsKey.currentState?.updateProgress("Image sent successfully!");
    print("Image sent successfully!");
  }


  // Capture the image without saving it
  void _captureImage() async {
    if (!_controller.value.isInitialized) return;
    // Display the captured image in the UI

    // Capture image as a file
    final XFile _capturedImage = await _controller.takePicture();

    // Compress the image
    final Uint8List? compressedImage = await FlutterImageCompress.compressWithFile(
      _capturedImage.path,
      quality: 50, // Adjust quality (0-100)
    );

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DisplayBodyMetricsScreen(
          key: bodyMetricsKey,
          connectedRaspi: rasPi,
          weight: widget.weight,
          initialProgress: "Sending Image...",
        ),
      ),
    );


    if (compressedImage != null) {
      // Send the compressed image over Bluetooth
      await sendViaBluetooth(compressedImage);
    }    

  }

  @override
  void dispose() {
    _controller.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(18),
        child: AppBar(
          backgroundColor: Colors.black,
        ),
      ),
      body: _isCameraInitialized
          ? Stack(
              children: [
                Column(
                  children: [
                    SizedBox(
                      height: 570,
                      child: Transform(
                        alignment: Alignment.center,
                        transform: Matrix4.rotationY(3.14159), // Flip the camera horizontally (mirror effect)
                        child: AspectRatio(
                          aspectRatio: _controller.value.aspectRatio,
                          child: CameraPreview(_controller),
                        ),
                      ),
                    ),
                    Align(
                      alignment: Alignment.bottomCenter,
                      child: Stack(
                        children: [
                          // Background Container
                          Container(
                            height: 89,
                            color: Colors.black,
                          ),

                          // Conditionally render the capture button
                          if (_writeCharacteristic != null)
                            Positioned(
                              bottom: 13, // Adjust to move the button lower
                              left: 0,
                              right: 0,
                              child: GestureDetector(
                                onTap: () {
                                  // Capture the image
                                  _captureImage();
                                },
                                child: Container(
                                  width: 60,
                                  height: 60,
                                  decoration: const BoxDecoration(
                                    color: Colors.white,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Center(
                                    child: Icon(Icons.camera, color: Colors.black, size: 30),
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
                Center(
                  child: Container(
                    width: squareSize,
                    height: squareSize,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: _squaredColor,
                        width: 3,
                      ),
                    ),
                  ),
                ),
              ],
            )
          : const Center(child: CircularProgressIndicator()),
    );
  }
}
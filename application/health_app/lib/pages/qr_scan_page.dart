import 'package:flutter/material.dart';
import 'package:health_app/pages/qr_result_page.dart';
import 'package:health_app/widgets/custom_footer.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
// import 'package:qr_scanner_overlay/qr_scanner_overlay.dart';

class QrScanPage extends StatefulWidget {
  const QrScanPage({Key? key}) : super(key: key);

  @override
  State<QrScanPage> createState() => _QrScanPageState();
}

class _QrScanPageState extends State<QrScanPage> {
  final int index = 2;
  final MobileScannerController controller = MobileScannerController();
  bool isScanCompleted = false;

  void closeScanScreen() {
    setState(() {
      isScanCompleted = false;
    });
    controller.start(); // Khởi động lại camera khi quay lại màn hình quét
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  void _handleBarcodeDetected(BarcodeCapture capture) {
    if (!isScanCompleted) {
      setState(() {
        isScanCompleted = true;
      });
      final List<Barcode> barcodes = capture.barcodes;
      for (final barcode in barcodes) {
        final String? rawValue = barcode.rawValue;
        if (rawValue != null) {
          debugPrint('Mã QR: $rawValue');
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Mã: $rawValue')),
          );
          // Thực hiện các hành động khác tại đây, ví dụ: chuyển màn hình hoặc xử lý dữ liệu
          Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => QrResultPage(
                        closeScreen: closeScanScreen,
                        code: rawValue,
                      )));
        }
      }
      controller.stop(); // Dừng camera sau khi quét thành công
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          centerTitle: true,
          title: const Text(
            "QR Scanner",
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 24,
              letterSpacing: 1,
            ),
          ),
        ),
        body: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              const Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Đặt QR vào khung bên dưới",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        letterSpacing: 1,
                      ),
                    ),
                    Text(
                      "Việc quét sẽ bắt đầu tự động",
                      style: TextStyle(fontSize: 16),
                    ),
                    SizedBox(height: 10),
                  ],
                ),
              ),
              Expanded(
                flex: 4,
                child: Stack(children: [
                  MobileScanner(
                    controller: controller,
                    onDetect: _handleBarcodeDetected,
                  ),
                  // QRScannerOverlay(
                  //   overlayColor: Colors.black12,
                  //   scanAreaSize: const Size(150, 150),
                  //   borderColor: Colors.white,
                  //   borderRadius: 10,
                  //   borderStrokeWidth: 5,
                  // ),
                ]),
              ),
              const Expanded(
                child: Center(
                  child: Text(
                    "Copyright©2025",
                    style: TextStyle(fontSize: 14),
                  ),
                ),
              ),
            ],
          ),
        ),
        bottomNavigationBar: CustomFooter(curIdx: index));
  }
}

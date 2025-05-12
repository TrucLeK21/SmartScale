import 'package:flutter/material.dart';
// import 'package:health_app/pages/qr_result_page.dart';
import 'package:health_app/services/user_services.dart';
import 'package:health_app/widgets/custom_footer.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:encrypt/encrypt.dart' as encrypt;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';
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

  void _handleBarcodeDetected(BarcodeCapture capture) async {
    if (!isScanCompleted) {
      setState(() {
        isScanCompleted = true;
      });
      final List<Barcode> barcodes = capture.barcodes;
      for (final barcode in barcodes) {
        final String? rawValue = barcode.rawValue;
        if (rawValue != null) {
          // debugPrint('Mã QR: $rawValue');

          String decryptedString = _decryptAES(rawValue,
              dotenv.env['AES_KEY'] ?? '', dotenv.env['IV_STRING'] ?? '');
          Map<String, dynamic> jsonData = jsonDecode(decryptedString);

          final response = await userServices().addNewRecord(jsonData);
          // ScaffoldMessenger.of(context).showSnackBar(
          //   SnackBar(content: Text(response ? "Đồng bộ thành công" : "Đồng bộ thất bại")),
          // );

          // Thực hiện các hành động khác tại đây, ví dụ: chuyển màn hình hoặc xử lý dữ liệu

          // Navigator.push(
          //     context,
          //     MaterialPageRoute(
          //         builder: (context) => QrResultPage(
          //               closeScreen: closeScanScreen,
          //               code: decryptedString,
          //             )));

          // // Hiển thị dialog thông báo
          await showDialog(
            context: context,
            builder: (BuildContext context) {
              return AlertDialog(
                title: Text(response ? "Thành công" : "Thất bại"),
                content: Text(response
                    ? "Đồng bộ dữ liệu thành công!"
                    : "Đồng bộ dữ liệu thất bại. Vui lòng thử lại."),
                actions: <Widget>[
                  TextButton(
                    child: const Text("Xác nhận"),
                    onPressed: () {
                      Navigator.of(context).pop(); // Đóng dialog
                    },
                  ),
                ],
              );
            },
          );

          // Sau khi người dùng bấm OK, khởi động lại camera
          closeScanScreen();
        }
      }
      // controller.stop(); // Dừng camera sau khi quét thành công
    }
  }

  String _decryptAES(
      String base64EncryptedText, String keyString, String ivString) {
    final key = encrypt.Key.fromUtf8(keyString); // 16 ký tự = 128-bit
    final iv = encrypt.IV.fromUtf8(ivString);
    final encrypter = encrypt.Encrypter(
      encrypt.AES(
        key,
        mode: encrypt.AESMode.cbc,
        padding: 'PKCS7',
      ),
    );

    final decrypted = encrypter.decrypt(
      encrypt.Encrypted.fromBase64(base64EncryptedText),
      iv: iv, // IV 16 ký tự
    );
    return decrypted;
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

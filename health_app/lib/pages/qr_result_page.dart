import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:health_app/consts.dart';
import 'package:qr_flutter/qr_flutter.dart';


class QrResultPage extends StatelessWidget {
  final String code;
  final Function() closeScreen;

  const QrResultPage({super.key, required this.closeScreen, required this.code});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        leading: BackButton(onPressed: () {
          closeScreen();
          Navigator.pop(context);
        },),
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
        alignment: Alignment.center,
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            QrImageView(data: code, size: 150, version: QrVersions.auto,),
            const Text(
              "Kết quả quét",
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(
              height: 10,
            ),
            Text(
              code,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 16,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(
              height: 40,
            ),
            SizedBox(
              width: MediaQuery.of(context).size.width - 100,
              height: 48,
              child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.appGreen,
                  ),
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: code));
                  },
                  child: const Text(
                    "Copy",
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  )),
            )
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:health_app/consts.dart';
import 'package:health_app/pages/ai_chat_page.dart';
// import 'package:health_app/pages/ble_page.dart';
import 'package:health_app/pages/create_group_page.dart';
import 'package:health_app/pages/detail_page.dart';
import 'package:health_app/pages/edit_profile_page.dart';
import 'package:health_app/pages/family_page.dart';
import 'package:health_app/pages/home_page.dart';
import 'package:health_app/pages/join_group_page.dart';
import 'package:health_app/pages/login_page.dart';
import 'package:health_app/pages/member_metrics_page.dart';
import 'package:health_app/pages/metric_detail_page.dart';
import 'package:health_app/pages/profile_page.dart';
import 'package:health_app/pages/qr_scan_page.dart';
import 'package:health_app/pages/register_page.dart';
import 'package:health_app/providers/chat_provider.dart';
import 'package:provider/provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  // Khóa hướng màn hình
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  runApp(ChangeNotifierProvider(
    create: (context) => ChatProvider(),
    child: const MyApp(),
  ));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return MaterialApp(
      title: 'Health App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        appBarTheme: const AppBarTheme(
          titleTextStyle: TextStyle(
            color: AppColors.mainColor,
            fontSize: 25,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      initialRoute: '/login',
      routes: {
        "/login": (context) => const LoginPage(),
        "/register": (context) => const RegisterPage(),
        "/home": (context) => const HomePage(),
        "/detail": (context) => const DetailPage(),
        "/family": (context) => const FamilyPage(),
        "/profile": (context) => const ProfilePage(),
        "/edit-profile": (context) => const EditProfilePage(),
        // "/ble-screen": (context) => const BlueetoothConnectionScreen(),
        "/create-group": (context) => const CreateGroupPage(),
        "/join-group": (context) => const JoinGroupPage(),
        "/member-metrics": (context) => const MemberMetricsPage(),
        "/qr-scan": (context) => const QrScanPage(),
        "/metric-detail": (context) => const MetricDetailPage(),
        "/ai-chat": (context) => const AiChatPage(),
      },
    );
  }
}

// import 'package:flutter/material.dart';

// void main() {
//   runApp(MyApp());
// }

// class MyApp extends StatelessWidget {
//   @override
//   Widget build(BuildContext context) {
//     return MaterialApp(
//       home: SendImageScreen(),
//     );
//   }
// }

// class SendImageScreen extends StatefulWidget {
//   @override
//   _SendImageScreenState createState() => _SendImageScreenState();
// }

// class _SendImageScreenState extends State<SendImageScreen> {
//   String status = "Sending Image...";

//   // GlobalKey to access the StatusScreen state
//   final GlobalKey<_StatusScreenState> _statusScreenKey = GlobalKey<_StatusScreenState>();

//   void sendImage() {
//     // Simulate sending the image (this could be an async task)
//     setState(() {
//       status = "Image Sending...";
//     });

//     // Navigate to StatusScreen
//     Navigator.push(
//       context,
//       MaterialPageRoute(
//         builder: (context) => StatusScreen(
//           key: _statusScreenKey,  // Pass the GlobalKey to the StatusScreen
//         ),
//       ),
//     );

//     // Simulate image sending completion and update StatusScreen
//     Future.delayed(Duration(seconds: 3), () {
//       // Use the GlobalKey to call the updateStatus function in StatusScreen
//       _statusScreenKey.currentState?.updateStatus("Image Sent!");
//     });
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(title: Text("Send Image")),
//       body: Center(
//         child: Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: [
//             Text("Status: $status", style: TextStyle(fontSize: 24)),
//             SizedBox(height: 20),
//             ElevatedButton(
//               onPressed: sendImage,
//               child: Text("Send Image"),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }

// class StatusScreen extends StatefulWidget {
//   StatusScreen({Key? key}) : super(key: key);

//   @override
//   _StatusScreenState createState() => _StatusScreenState();
// }

// class _StatusScreenState extends State<StatusScreen> {
//   String status = "Waiting for image...";

//   // Method to update status that can be called from SendImageScreen
//   void updateStatus(String newStatus) {
//     setState(() {
//       status = newStatus;
//     });
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(title: Text("Status Screen")),
//       body: Center(
//         child: Column(
//           mainAxisAlignment: MainAxisAlignment.center,
//           children: [
//             Text("Status: $status", style: TextStyle(fontSize: 24)),
//             SizedBox(height: 20),
//           ],
//         ),
//       ),
//     );
//   }
// }

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:path_provider/path_provider.dart' as path_provider;

import 'models/child.dart';
import 'models/screening.dart';
import 'models/worker.dart';
import 'models/diet_record.dart';
import 'services/sync_service.dart';
import 'screens/login_screen.dart';
import 'screens/child_list_screen.dart';
import 'screens/add_child_screen.dart';
import 'screens/screening_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive
  final appDocumentDir = await path_provider.getApplicationDocumentsDirectory();
  await Hive.initFlutter(appDocumentDir.path);
  
  // Register Hive Adapters
  Hive.registerAdapter(ChildAdapter());
  Hive.registerAdapter(ScreeningAdapter());
  Hive.registerAdapter(WorkerAdapter());
  Hive.registerAdapter(DietRecordAdapter());
  
  await Hive.openBox<Child>('children');
  await Hive.openBox<Screening>('screenings');
  await Hive.openBox<Worker>('workers');
  await Hive.openBox<DietRecord>('diet_records');
  
  await SyncService.init();

  runApp(const ProviderScope(child: CGMApp()));
}

class CGMApp extends StatelessWidget {
  const CGMApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CGM India',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      initialRoute: '/login',
      routes: {
        '/login': (context) => const LoginScreen(),
        '/home': (context) => const ChildListScreen(),
        '/child-list': (context) => const ChildListScreen(),
        '/add-child': (context) => const AddChildScreen(),
      },
    );
  }
}
import 'dart:io';
import 'package:excel/excel.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as path;
import 'package:uuid/uuid.dart';
import '../models/child.dart';
import '../models/screening.dart';
import '../models/worker.dart';
import '../models/diet_record.dart';

class ExcelService {
  static Future<String> exportChildrenToExcel(List<Child> children) async {
    final excel = Excel.createExcel();
    final sheet = excel['Children'];

    // Header row
    sheet.appendRow([
      'ID',
      'Name',
      'Age (Months)',
      'Sex',
      'Zone',
      'PIN Code',
      'Address',
      'Contact',
      'Created At',
      'Updated At',
    ]);

    // Data rows
    for (final child in children) {
      sheet.appendRow([
        child.id,
        child.name,
        child.ageMonths,
        child.sex,
        child.zone,
        child.pinCode,
        child.address,
        child.contact,
        child.createdAt.toIso8601String(),
        child.updatedAt.toIso8601String(),
      ]);
    }

    final directory = await getApplicationDocumentsDirectory();
    final fileName = 'children_${DateTime.now().millisecondsSinceEpoch}.xlsx';
    final filePath = path.join(directory.path, fileName);
    
    final file = File(filePath);
    await file.writeAsBytes(excel.encode()!);
    
    return filePath;
  }

  static Future<String> exportScreeningsToExcel(List<Screening> screenings) async {
    final excel = Excel.createExcel();
    final sheet = excel['Screenings'];

    // Header row
    sheet.appendRow([
      'ID',
      'Child ID',
      'Timestamp',
      'Height (cm)',
      'Weight (kg)',
      'BMI',
      'MUAC (cm)',
      'Z-Score',
      'Classification',
      'Clinical Observations',
      'Diet Details',
      'Nutrition Summary',
      'Deficiency Flags',
      'Intervention Details',
      'GPS Latitude',
      'GPS Longitude',
      'Video Path',
      'Synced',
    ]);

    // Data rows
    for (final screening in screenings) {
      sheet.appendRow([
        screening.id,
        screening.childId,
        screening.timestamp.toIso8601String(),
        screening.height,
        screening.weight,
        screening.bmi,
        screening.muac,
        screening.zScore,
        screening.classification,
        screening.clinicalObservations,
        screening.dietDetails,
        screening.nutritionSummary,
        screening.deficiencyFlags.join(', '),
        screening.interventionDetails,
        screening.gpsLatitude,
        screening.gpsLongitude,
        screening.videoPath,
        screening.isSynced ? 'Yes' : 'No',
      ]);
    }

    final directory = await getApplicationDocumentsDirectory();
    final fileName = 'screenings_${DateTime.now().millisecondsSinceEpoch}.xlsx';
    final filePath = path.join(directory.path, fileName);
    
    final file = File(filePath);
    await file.writeAsBytes(excel.encode()!);
    
    return filePath;
  }

  static Future<List<Child>> importChildrenFromExcel(String filePath) async {
    final bytes = await File(filePath).readAsBytes();
    final excel = Excel.decodeBytes(bytes);
    final sheet = excel['Children'];
    
    final children = <Child>[];
    
    // Skip header row
    for (var i = 1; i < sheet.rows.length; i++) {
      final row = sheet.rows[i];
      if (row.isEmpty) continue;
      
      try {
        final child = Child(
          id: row[0]?.value?.toString() ?? '',
          name: row[1]?.value?.toString() ?? '',
          ageMonths: int.tryParse(row[2]?.value?.toString() ?? '0') ?? 0,
          sex: row[3]?.value?.toString() ?? 'M',
          zone: row[4]?.value?.toString() ?? 'Unknown',
          pinCode: row[5]?.value?.toString() ?? '',
          address: row[6]?.value?.toString() ?? '',
          contact: row[7]?.value?.toString() ?? '',
          createdAt: DateTime.tryParse(row[8]?.value?.toString() ?? '') ?? DateTime.now(),
          updatedAt: DateTime.tryParse(row[9]?.value?.toString() ?? '') ?? DateTime.now(),
        );
        
        if (child.id.isNotEmpty && child.name.isNotEmpty) {
          children.add(child);
        }
      } catch (e) {
        print('Error parsing row $i: $e');
      }
    }
    
    return children;
  }

  static Future<List<Screening>> importScreeningsFromExcel(String filePath) async {
    final bytes = await File(filePath).readAsBytes();
    final excel = Excel.decodeBytes(bytes);
    final sheet = excel['Screenings'];
    
    final screenings = <Screening>[];
    
    // Skip header row
    for (var i = 1; i < sheet.rows.length; i++) {
      final row = sheet.rows[i];
      if (row.isEmpty) continue;
      
      try {
        final screening = Screening(
          id: row[0]?.value?.toString() ?? '',
          childId: row[1]?.value?.toString() ?? '',
          timestamp: DateTime.tryParse(row[2]?.value?.toString() ?? '') ?? DateTime.now(),
          height: double.tryParse(row[3]?.value?.toString() ?? '0') ?? 0,
          weight: double.tryParse(row[4]?.value?.toString() ?? '0') ?? 0,
          bmi: double.tryParse(row[5]?.value?.toString() ?? '0') ?? 0,
          muac: double.tryParse(row[6]?.value?.toString() ?? '0') ?? 0,
          zScore: double.tryParse(row[7]?.value?.toString() ?? '0') ?? 0,
          classification: row[8]?.value?.toString() ?? '',
          clinicalObservations: row[9]?.value?.toString() ?? '',
          dietDetails: row[10]?.value?.toString() ?? '',
          nutritionSummary: row[11]?.value?.toString() ?? '',
          deficiencyFlags: (row[12]?.value?.toString() ?? '').split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList(),
          interventionDetails: row[13]?.value?.toString() ?? '',
          gpsLatitude: double.tryParse(row[14]?.value?.toString() ?? '0') ?? 0,
          gpsLongitude: double.tryParse(row[15]?.value?.toString() ?? '0') ?? 0,
          videoPath: row[16]?.value?.toString() ?? '',
          isSynced: (row[17]?.value?.toString() ?? '').toLowerCase() == 'yes',
        );
        
        if (screening.id.isNotEmpty && screening.childId.isNotEmpty) {
          screenings.add(screening);
        }
      } catch (e) {
        print('Error parsing screening row $i: $e');
      }
    }
    
    return screenings;
  }

  static Future<String> exportWorkersToExcel(List<Worker> workers) async {
    final excel = Excel.createExcel();
    final sheet = excel['Workers'];
    
    // Headers
    sheet.appendRow([
      'ID',
      'Name',
      'Zone',
      'Phone',
      'Email',
      'Role',
      'Created At',
      'Updated At',
    ]);
    
    // Data
    for (final worker in workers) {
      sheet.appendRow([
        worker.id,
        worker.name,
        worker.zone,
        worker.phone,
        worker.email,
        worker.role,
        worker.createdAt.toIso8601String(),
        worker.updatedAt.toIso8601String(),
      ]);
    }
    
    final bytes = excel.save();
    final directory = await getApplicationDocumentsDirectory();
    final fileName = 'workers_${DateTime.now().millisecondsSinceEpoch}.xlsx';
    final filePath = path.join(directory.path, fileName);
    
    final file = File(filePath);
    await file.writeAsBytes(bytes!);
    
    return filePath;
  }

  static Future<List<Worker>> importWorkersFromExcel(String filePath) async {
    final bytes = File(filePath).readAsBytesSync();
    final excel = Excel.decodeBytes(bytes);
    final sheet = excel['Workers'];
    
    final workers = <Worker>[];
    
    for (var i = 1; i < sheet.maxRows; i++) {
      final row = sheet.row(i);
      if (row.isEmpty) continue;
      
      workers.add(Worker(
        id: row[0]?.value?.toString() ?? const Uuid().v4(),
        name: row[1]?.value?.toString() ?? '',
        zone: row[2]?.value?.toString() ?? '',
        phone: row[3]?.value?.toString() ?? '',
        email: row[4]?.value?.toString() ?? '',
        role: row[5]?.value?.toString() ?? 'worker',
        createdAt: DateTime.tryParse(row[6]?.value?.toString() ?? '') ?? DateTime.now(),
        updatedAt: DateTime.tryParse(row[7]?.value?.toString() ?? '') ?? DateTime.now(),
      ));
    }
    
    return workers;
  }

  static Future<String> exportDietRecordsToExcel(List<DietRecord> records) async {
    final excel = Excel.createExcel();
    final sheet = excel['DietRecords'];

    // Header row
    sheet.appendRow([
      'ID',
      'Child ID',
      'Date',
      'Meal Type',
      'Total Calories',
      'Total Protein (g)',
      'Total Carbs (g)',
      'Total Fat (g)',
      'Total Fiber (g)',
      'Food Items',
      'Notes',
      'Created At',
      'Updated At',
    ]);

    // Data rows
    for (final record in records) {
      final foodItems = record.foodItems.map((item) =>
          '${item.name} (${item.quantity}${item.unit})'
      ).join('; ');

      sheet.appendRow([
        record.id,
        record.childId,
        record.date.toIso8601String().split('T')[0],
        record.mealType,
        record.totalCalories,
        record.totalProtein,
        record.totalCarbs,
        record.totalFat,
        record.totalFiber,
        foodItems,
        record.notes ?? '',
        record.createdAt.toIso8601String(),
        record.updatedAt.toIso8601String(),
      ]);
    }

    final directory = await getApplicationDocumentsDirectory();
    final fileName = 'diet_records_${DateTime.now().millisecondsSinceEpoch}.xlsx';
    final filePath = path.join(directory.path, fileName);

    final file = File(filePath);
    await file.writeAsBytes(excel.encode()!);

    return filePath;
  }

  static Future<List<DietRecord>> importDietRecordsFromExcel(String filePath) async {
    final bytes = await File(filePath).readAsBytes();
    final excel = Excel.decodeBytes(bytes);
    final sheet = excel['DietRecords'];

    final records = <DietRecord>[];

    // Skip header row
    for (var i = 1; i < sheet.rows.length; i++) {
      final row = sheet.rows[i];
      if (row.isEmpty) continue;

      try {
        final foodItems = <FoodItem>[
          FoodItem(
            id: const Uuid().v4(),
            name: 'Imported Meal',
            quantity: 100,
            unit: 'g',
            calories: double.tryParse(row[4]?.value?.toString() ?? '0') ?? 0,
            protein: double.tryParse(row[5]?.value?.toString() ?? '0') ?? 0,
            carbs: double.tryParse(row[6]?.value?.toString() ?? '0') ?? 0,
            fat: double.tryParse(row[7]?.value?.toString() ?? '0') ?? 0,
            fiber: double.tryParse(row[8]?.value?.toString() ?? '0') ?? 0,
            category: 'imported',
          ),
        ];

        final record = DietRecord(
          id: row[0]?.value?.toString() ?? const Uuid().v4(),
          childId: row[1]?.value?.toString() ?? '',
          date: DateTime.tryParse(row[2]?.value?.toString() ?? '') ?? DateTime.now(),
          mealType: row[3]?.value?.toString() ?? 'lunch',
          foodItems: foodItems,
          notes: row[10]?.value?.toString(),
          totalCalories: double.tryParse(row[4]?.value?.toString() ?? '0') ?? 0,
          totalProtein: double.tryParse(row[5]?.value?.toString() ?? '0') ?? 0,
          totalCarbs: double.tryParse(row[6]?.value?.toString() ?? '0') ?? 0,
          totalFat: double.tryParse(row[7]?.value?.toString() ?? '0') ?? 0,
          totalFiber: double.tryParse(row[8]?.value?.toString() ?? '0') ?? 0,
          nutritionAnalysis: null,
          createdAt: DateTime.tryParse(row[11]?.value?.toString() ?? '') ?? DateTime.now(),
          updatedAt: DateTime.tryParse(row[12]?.value?.toString() ?? '') ?? DateTime.now(),
        );

        if (record.id.isNotEmpty && record.childId.isNotEmpty) {
          records.add(record);
        }
      } catch (e) {
        print('Error parsing diet record row $i: $e');
      }
    }

    return records;
  }

  static Future<String> createTemplateFile() async {
    final excel = Excel.createExcel();

    // Children template
    final childrenSheet = excel['Children'];
    childrenSheet.appendRow([
      'ID',
      'Name',
      'Age (Months)',
      'Sex',
      'Zone',
      'PIN Code',
      'Address',
      'Contact',
    ]);

    // Add sample row
    childrenSheet.appendRow([
      'CHILD001',
      'Sample Child',
      '24',
      'M',
      'Zone A',
      '400001',
      'Sample Address',
      '9876543210',
    ]);

    // Workers template
    final workersSheet = excel['Workers'];
    workersSheet.appendRow([
      'ID',
      'Name',
      'Zone',
      'Phone',
      'Email',
      'Role',
    ]);

    // Add sample worker
    workersSheet.appendRow([
      'WORKER001',
      'Sample Worker',
      'Zone A',
      '9876543210',
      'worker@example.com',
      'worker',
    ]);

    // Diet Records template
    final dietSheet = excel['DietRecords'];
    dietSheet.appendRow([
      'ID',
      'Child ID',
      'Date (YYYY-MM-DD)',
      'Meal Type',
      'Total Calories',
      'Total Protein (g)',
      'Total Carbs (g)',
      'Total Fat (g)',
      'Total Fiber (g)',
      'Food Items',
      'Notes',
    ]);

    final directory = await getApplicationDocumentsDirectory();
    final fileName = 'template.xlsx';
    final filePath = path.join(directory.path, fileName);

    final file = File(filePath);
    await file.writeAsBytes(excel.encode()!);

    return filePath;
  }
}
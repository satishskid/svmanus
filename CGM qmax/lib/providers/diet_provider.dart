import 'package:flutter/material.dart';
import 'package:hive/hive.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:convert';
import '../models/diet_record.dart';
import '../models/child.dart';
import '../services/excel_service.dart';
import '../services/sync_service.dart';

class DietProvider extends ChangeNotifier {
  Box<DietRecord>? _dietBox;
  List<DietRecord> _dietRecords = [];

  List<DietRecord> get dietRecords => _dietRecords;

  Future<void> initialize() async {
    _dietBox = await Hive.openBox<DietRecord>('diet_records');
    await loadDietRecords();
  }

  Future<void> loadDietRecords() async {
    if (_dietBox != null) {
      _dietRecords = _dietBox!.values.toList();
      notifyListeners();
    }
  }

  Future<void> addDietRecord(DietRecord record) async {
    await _dietBox?.put(record.id, record);
    await loadDietRecords();
    
    // Queue sync operation
    await SyncService.queueSyncOperation('create', 'diet_record', record.toMap());
  }

  Future<void> updateDietRecord(DietRecord record) async {
    await _dietBox?.put(record.id, record);
    await loadDietRecords();
    
    // Queue sync operation
    await SyncService.queueSyncOperation('update', 'diet_record', record.toMap());
  }

  Future<void> deleteDietRecord(String id) async {
    await _dietBox?.delete(id);
    await loadDietRecords();
    
    // Queue sync operation
    await SyncService.queueSyncOperation('delete', 'diet_record', {'id': id});
  }

  List<DietRecord> getDietRecordsForChild(String childId) {
    return _dietRecords.where((record) => record.childId == childId).toList();
  }

  List<DietRecord> getDietRecordsForDateRange(DateTime start, DateTime end) {
    return _dietRecords.where((record) => 
      record.date.isAfter(start.subtract(const Duration(days: 1))) && 
      record.date.isBefore(end.add(const Duration(days: 1)))
    ).toList();
  }

  // Nutrition Analysis Methods
  Map<String, dynamic> getDailyNutritionSummary(String childId, DateTime date) {
    final records = getDietRecordsForChild(childId)
        .where((record) => 
          record.date.year == date.year && 
          record.date.month == date.month && 
          record.date.day == date.day
        ).toList();

    double totalCalories = 0;
    double totalProtein = 0;
    double totalCarbs = 0;
    double totalFat = 0;
    double totalFiber = 0;

    for (var record in records) {
      totalCalories += record.totalCalories;
      totalProtein += record.totalProtein;
      totalCarbs += record.totalCarbs;
      totalFat += record.totalFat;
      totalFiber += record.totalFiber;
    }

    return {
      'totalCalories': totalCalories,
      'totalProtein': totalProtein,
      'totalCarbs': totalCarbs,
      'totalFat': totalFat,
      'totalFiber': totalFiber,
      'mealCount': records.length,
    };
  }

  Map<String, dynamic> getWeeklyNutritionSummary(String childId, DateTime startDate) {
    final endDate = startDate.add(const Duration(days: 6));
    final records = getDietRecordsForChild(childId)
        .where((record) => 
          record.date.isAfter(startDate.subtract(const Duration(days: 1))) && 
          record.date.isBefore(endDate.add(const Duration(days: 1)))
        ).toList();

    double totalCalories = 0;
    double totalProtein = 0;
    double totalCarbs = 0;
    double totalFat = 0;
    double totalFiber = 0;

    for (var record in records) {
      totalCalories += record.totalCalories;
      totalProtein += record.totalProtein;
      totalCarbs += record.totalCarbs;
      totalFat += record.totalFat;
      totalFiber += record.totalFiber;
    }

    return {
      'totalCalories': totalCalories,
      'totalProtein': totalProtein,
      'totalCarbs': totalCarbs,
      'totalFat': totalFat,
      'totalFiber': totalFiber,
      'averageDailyCalories': records.isEmpty ? 0 : totalCalories / 7,
      'mealCount': records.length,
    };
  }

  Map<String, dynamic> analyzeNutritionDeficiencies(Child child, DateTime date) {
    final dailySummary = getDailyNutritionSummary(child.id, date);
    final ageMonths = child.age;
    
    // WHO recommended daily intake for children
    final recommended = _getRecommendedIntake(ageMonths);
    
    final deficiencies = <String, dynamic>{};
    
    if (dailySummary['totalCalories'] < recommended['calories']) {
      deficiencies['calories'] = {
        'current': dailySummary['totalCalories'],
        'recommended': recommended['calories'],
        'deficit': recommended['calories'] - dailySummary['totalCalories'],
      };
    }
    
    if (dailySummary['totalProtein'] < recommended['protein']) {
      deficiencies['protein'] = {
        'current': dailySummary['totalProtein'],
        'recommended': recommended['protein'],
        'deficit': recommended['protein'] - dailySummary['totalProtein'],
      };
    }
    
    return {
      'deficiencies': deficiencies,
      'summary': dailySummary,
      'recommendations': _generateRecommendations(deficiencies, ageMonths),
    };
  }

  Map<String, double> _getRecommendedIntake(int ageMonths) {
    if (ageMonths < 12) {
      return {
        'calories': 800,
        'protein': 13,
        'carbs': 95,
        'fat': 30,
        'fiber': 19,
      };
    } else if (ageMonths < 24) {
      return {
        'calories': 1000,
        'protein': 16,
        'carbs': 130,
        'fat': 35,
        'fiber': 19,
      };
    } else if (ageMonths < 36) {
      return {
        'calories': 1200,
        'protein': 19,
        'carbs': 130,
        'fat': 40,
        'fiber': 25,
      };
    } else if (ageMonths < 48) {
      return {
        'calories': 1400,
        'protein': 22,
        'carbs': 130,
        'fat': 45,
        'fiber': 25,
      };
    } else {
      return {
        'calories': 1600,
        'protein': 25,
        'carbs': 130,
        'fat': 50,
        'fiber': 31,
      };
    }
  }

  List<String> _generateRecommendations(
    Map<String, dynamic> deficiencies, 
    int ageMonths
  ) {
    final recommendations = <String>[];
    
    if (deficiencies.containsKey('calories')) {
      recommendations.add('Increase caloric intake with energy-dense foods');
      recommendations.add('Add healthy fats like ghee, nuts, and seeds');
    }
    
    if (deficiencies.containsKey('protein')) {
      recommendations.add('Include more protein-rich foods like lentils, eggs, and dairy');
      recommendations.add('Add small portions of meat or fish if culturally appropriate');
    }
    
    // Age-specific recommendations
    if (ageMonths < 12) {
      recommendations.add('Continue breastfeeding alongside complementary foods');
    } else if (ageMonths < 24) {
      recommendations.add('Ensure 3-4 meals plus 1-2 snacks daily');
    } else {
      recommendations.add('Provide 3 main meals and 2 healthy snacks daily');
    }
    
    return recommendations;
  }

  // Excel Import/Export
  Future<void> importFromExcel() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['xlsx', 'xls'],
      );

      if (result != null) {
        final file = result.files.first;
        final excelService = ExcelService();
        final records = await excelService.importDietRecordsFromExcel(file.path!);
        
        for (var record in records) {
          await addDietRecord(record);
        }
      }
    } catch (e) {
      debugPrint('Error importing diet records: $e');
    }
  }

  Future<void> exportToExcel() async {
    try {
      final excelService = ExcelService();
      await excelService.exportDietRecordsToExcel(_dietRecords);
    } catch (e) {
      debugPrint('Error exporting diet records: $e');
    }
  }

  // Food Database Methods
  List<FoodItem> getCommonFoodItems() {
    return [
      FoodItem(
        id: 'rice',
        name: 'Rice (cooked)',
        quantity: 100,
        unit: 'g',
        calories: 130,
        protein: 2.7,
        carbs: 28,
        fat: 0.3,
        fiber: 0.4,
        category: 'grains',
      ),
      FoodItem(
        id: 'dal',
        name: 'Lentils (cooked)',
        quantity: 100,
        unit: 'g',
        calories: 116,
        protein: 9.0,
        carbs: 20.1,
        fat: 0.4,
        fiber: 7.9,
        category: 'proteins',
      ),
      FoodItem(
        id: 'milk',
        name: 'Milk (whole)',
        quantity: 100,
        unit: 'ml',
        calories: 61,
        protein: 3.2,
        carbs: 4.8,
        fat: 3.3,
        fiber: 0,
        category: 'dairy',
      ),
      FoodItem(
        id: 'egg',
        name: 'Egg (whole)',
        quantity: 1,
        unit: 'piece',
        calories: 72,
        protein: 6.3,
        carbs: 0.4,
        fat: 5.0,
        fiber: 0,
        category: 'proteins',
      ),
      FoodItem(
        id: 'banana',
        name: 'Banana',
        quantity: 100,
        unit: 'g',
        calories: 89,
        protein: 1.1,
        carbs: 22.8,
        fat: 0.3,
        fiber: 2.6,
        category: 'fruits',
      ),
      FoodItem(
        id: 'spinach',
        name: 'Spinach',
        quantity: 100,
        unit: 'g',
        calories: 23,
        protein: 2.9,
        carbs: 3.6,
        fat: 0.4,
        fiber: 2.2,
        category: 'vegetables',
      ),
    ];
  }
}
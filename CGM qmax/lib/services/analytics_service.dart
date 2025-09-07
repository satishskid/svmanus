import 'package:intl/intl.dart';
import '../models/child.dart';
import '../models/screening.dart';
import '../models/diet_record.dart';

class AnalyticsService {
  // Growth analytics
  static Map<String, dynamic> analyzeGrowthTrends(List<Child> children, List<Screening> screenings) {
    final Map<String, dynamic> result = {};
    
    for (final child in children) {
      final childScreenings = screenings.where((s) => s.childId == child.id).toList()
        ..sort((a, b) => a.date.compareTo(b.date));
      
      if (childScreenings.isEmpty) continue;
      
      final heightData = childScreenings.map((s) => {
        'date': s.date,
        'height': s.height,
        'age': _calculateAgeInMonths(child.dateOfBirth, s.date),
      }).toList();
      
      final weightData = childScreenings.map((s) => {
        'date': s.date,
        'weight': s.weight,
        'age': _calculateAgeInMonths(child.dateOfBirth, s.date),
      }).toList();
      
      final bmiData = childScreenings.map((s) => {
        'date': s.date,
        'bmi': s.weight / ((s.height / 100) * (s.height / 100)),
        'age': _calculateAgeInMonths(child.dateOfBirth, s.date),
      }).toList();
      
      result[child.id] = {
        'childName': child.name,
        'heightTrend': heightData,
        'weightTrend': weightData,
        'bmiTrend': bmiData,
        'latestScreening': childScreenings.last,
        'growthVelocity': _calculateGrowthVelocity(childScreenings),
      };
    }
    
    return result;
  }

  // Nutrition analysis
  static Map<String, dynamic> analyzeNutrition(List<DietRecord> dietRecords, List<Child> children) {
    final Map<String, dynamic> result = {};
    
    for (final child in children) {
      final childRecords = dietRecords.where((d) => d.childId == child.id).toList();
      
      if (childRecords.isEmpty) continue;
      
      final ageInMonths = _calculateAgeInMonths(child.dateOfBirth, DateTime.now());
      final dailyRequirements = _getDailyRequirements(ageInMonths);
      
      // Weekly nutrition summary
      final weeklySummary = _getWeeklyNutritionSummary(childRecords, dailyRequirements);
      
      // Monthly trends
      final monthlyTrends = _getMonthlyNutritionTrends(childRecords);
      
      // Deficiency analysis
      final deficiencies = _analyzeDeficiencies(weeklySummary, dailyRequirements);
      
      result[child.id] = {
        'childName': child.name,
        'weeklySummary': weeklySummary,
        'monthlyTrends': monthlyTrends,
        'deficiencies': deficiencies,
        'riskLevel': _assessNutritionRisk(deficiencies),
      };
    }
    
    return result;
  }

  // Screening summary by zone
  static Map<String, dynamic> getZoneScreeningSummary(List<Child> children, List<Screening> screenings) {
    final Map<String, dynamic> result = {};
    
    final zoneMap = <String, List<Child>>{};
    for (final child in children) {
      zoneMap.putIfAbsent(child.zone, () => []).add(child);
    }
    
    for (final zone in zoneMap.keys) {
      final zoneChildren = zoneMap[zone]!;
      final zoneScreenings = screenings.where((s) => 
        zoneChildren.any((c) => c.id == s.childId)
      ).toList();
      
      final summary = _createScreeningSummary(zoneScreenings, zoneChildren);
      result[zone] = summary;
    }
    
    return result;
  }

  // Malnutrition analysis
  static Map<String, dynamic> analyzeMalnutrition(List<Child> children, List<Screening> screenings) {
    final Map<String, dynamic> result = {
      'totalChildren': children.length,
      'screenedChildren': 0,
      'malnourishedChildren': 0,
      'severeCases': 0,
      'byCategory': {},
      'byZone': {},
      'byAgeGroup': {},
    };
    
    final screenedChildren = <String>{};
    final malnourished = <String, Map<String, dynamic>>{};
    
    for (final screening in screenings) {
      screenedChildren.add(screening.childId);
      
      final child = children.firstWhere((c) => c.id == screening.childId);
      final ageInMonths = _calculateAgeInMonths(child.dateOfBirth, screening.date);
      
      final malnutritionStatus = _assessMalnutrition(screening, ageInMonths);
      
      if (malnutritionStatus['isMalnourished']) {
        malnourished[screening.childId] = {
          'child': child,
          'screening': screening,
          'status': malnutritionStatus,
        };
      }
    }
    
    result['screenedChildren'] = screenedChildren.length;
    result['malnourishedChildren'] = malnourished.length;
    result['severeCases'] = malnourished.values.where((m) => 
      m['status']['severity'] == 'severe'
    ).length;
    
    // Group by category
    result['byCategory'] = _groupMalnutritionByCategory(malnourished);
    result['byZone'] = _groupMalnutritionByZone(malnourished);
    result['byAgeGroup'] = _groupMalnutritionByAgeGroup(malnourished);
    
    return result;
  }

  // Generate comprehensive report
  static Map<String, dynamic> generateComprehensiveReport({
    required List<Child> children,
    required List<Screening> screenings,
    required List<DietRecord> dietRecords,
    DateTime? startDate,
    DateTime? endDate,
  }) {
    startDate ??= DateTime.now().subtract(const Duration(days: 30));
    endDate ??= DateTime.now();
    
    final filteredScreenings = screenings.where((s) => 
      s.date.isAfter(startDate!) && s.date.isBefore(endDate!)
    ).toList();
    
    final filteredDietRecords = dietRecords.where((d) => 
      d.date.isAfter(startDate) && d.date.isBefore(endDate)
    ).toList();
    
    return {
      'period': {
        'start': startDate,
        'end': endDate,
      },
      'overview': {
        'totalChildren': children.length,
        'screenedInPeriod': filteredScreenings.map((s) => s.childId).toSet().length,
        'totalScreenings': filteredScreenings.length,
        'totalDietRecords': filteredDietRecords.length,
      },
      'growthAnalysis': analyzeGrowthTrends(children, filteredScreenings),
      'nutritionAnalysis': analyzeNutrition(filteredDietRecords, children),
      'malnutritionAnalysis': analyzeMalnutrition(children, filteredScreenings),
      'zoneSummary': getZoneScreeningSummary(children, filteredScreenings),
      'recommendations': _generateRecommendations(children, filteredScreenings, filteredDietRecords),
    };
  }

  // Helper methods
  static int _calculateAgeInMonths(DateTime birthDate, DateTime currentDate) {
    return currentDate.difference(birthDate).inDays ~/ 30;
  }

  static Map<String, dynamic> _calculateGrowthVelocity(List<Screening> screenings) {
    if (screenings.length < 2) return {};
    
    final sorted = screenings..sort((a, b) => a.date.compareTo(b.date));
    final recent = sorted.take(3).toList();
    
    if (recent.length < 2) return {};
    
    final heightVelocity = (recent.last.height - recent.first.height) / 
      (recent.last.date.difference(recent.first.date).inDays / 30);
    
    final weightVelocity = (recent.last.weight - recent.first.weight) / 
      (recent.last.date.difference(recent.first.date).inDays / 30);
    
    return {
      'heightVelocityCmPerMonth': heightVelocity,
      'weightVelocityKgPerMonth': weightVelocity,
    };
  }

  static Map<String, dynamic> _getDailyRequirements(int ageInMonths) {
    // WHO guidelines for daily requirements
    if (ageInMonths < 6) {
      return {
        'calories': 550,
        'protein': 9.1,
        'iron': 0.27,
        'vitaminA': 400,
        'calcium': 200,
      };
    } else if (ageInMonths < 12) {
      return {
        'calories': 720,
        'protein': 11,
        'iron': 11,
        'vitaminA': 500,
        'calcium': 260,
      };
    } else if (ageInMonths < 24) {
      return {
        'calories': 900,
        'protein': 13,
        'iron': 7,
        'vitaminA': 300,
        'calcium': 700,
      };
    } else if (ageInMonths < 36) {
      return {
        'calories': 1000,
        'protein': 16,
        'iron': 7,
        'vitaminA': 300,
        'calcium': 700,
      };
    } else {
      return {
        'calories': 1200,
        'protein': 19,
        'iron': 10,
        'vitaminA': 400,
        'calcium': 1000,
      };
    }
  }

  static Map<String, dynamic> _getWeeklyNutritionSummary(
    List<DietRecord> records,
    Map<String, dynamic> requirements,
  ) {
    if (records.isEmpty) return {};
    
    final lastWeek = records.where((r) => 
      r.date.isAfter(DateTime.now().subtract(const Duration(days: 7)))
    ).toList();
    
    final totalNutrition = lastWeek.fold<Map<String, double>>({
      'calories': 0,
      'protein': 0,
      'iron': 0,
      'vitaminA': 0,
      'calcium': 0,
    }, (sum, record) {
      sum['calories'] = (sum['calories'] ?? 0) + record.totalCalories;
      sum['protein'] = (sum['protein'] ?? 0) + record.totalProtein;
      sum['iron'] = (sum['iron'] ?? 0) + record.totalIron;
      sum['vitaminA'] = (sum['vitaminA'] ?? 0) + record.totalVitaminA;
      sum['calcium'] = (sum['calcium'] ?? 0) + record.totalCalcium;
      return sum;
    });
    
    final dailyAverage = {
      'calories': totalNutrition['calories']! / 7,
      'protein': totalNutrition['protein']! / 7,
      'iron': totalNutrition['iron']! / 7,
      'vitaminA': totalNutrition['vitaminA']! / 7,
      'calcium': totalNutrition['calcium']! / 7,
    };
    
    return {
      'dailyAverage': dailyAverage,
      'weeklyTotal': totalNutrition,
      'meetingRequirements': {
        'calories': dailyAverage['calories']! >= requirements['calories']!,
        'protein': dailyAverage['protein']! >= requirements['protein']!,
        'iron': dailyAverage['iron']! >= requirements['iron']!,
        'vitaminA': dailyAverage['vitaminA']! >= requirements['vitaminA']!,
        'calcium': dailyAverage['calcium']! >= requirements['calcium']!,
      },
    };
  }

  static List<Map<String, dynamic>> _getMonthlyNutritionTrends(List<DietRecord> records) {
    if (records.isEmpty) return [];
    
    final monthlyData = <String, Map<String, List<double>>>{};
    
    for (final record in records) {
      final monthKey = DateFormat('yyyy-MM').format(record.date);
      
      monthlyData.putIfAbsent(monthKey, () => ({
        'calories': [],
        'protein': [],
        'iron': [],
        'vitaminA': [],
        'calcium': [],
      }));
      
      monthlyData[monthKey]!['calories']!.add(record.totalCalories);
      monthlyData[monthKey]!['protein']!.add(record.totalProtein);
      monthlyData[monthKey]!['iron']!.add(record.totalIron);
      monthlyData[monthKey]!['vitaminA']!.add(record.totalVitaminA);
      monthlyData[monthKey]!['calcium']!.add(record.totalCalcium);
    }
    
    return monthlyData.entries.map((entry) => {
      'month': entry.key,
      'averageCalories': entry.value['calories']!.reduce((a, b) => a + b) / entry.value['calories']!.length,
      'averageProtein': entry.value['protein']!.reduce((a, b) => a + b) / entry.value['protein']!.length,
      'averageIron': entry.value['iron']!.reduce((a, b) => a + b) / entry.value['iron']!.length,
      'averageVitaminA': entry.value['vitaminA']!.reduce((a, b) => a + b) / entry.value['vitaminA']!.length,
      'averageCalcium': entry.value['calcium']!.reduce((a, b) => a + b) / entry.value['calcium']!.length,
    }).toList();
  }

  static List<String> _analyzeDeficiencies(Map<String, dynamic> summary, Map<String, dynamic> requirements) {
    final deficiencies = <String>[];
    final dailyAverage = summary['dailyAverage'] as Map<String, dynamic>;
    
    if (dailyAverage['calories']! < requirements['calories']!) {
      deficiencies.add('Low calorie intake');
    }
    if (dailyAverage['protein']! < requirements['protein']!) {
      deficiencies.add('Protein deficiency');
    }
    if (dailyAverage['iron']! < requirements['iron']!) {
      deficiencies.add('Iron deficiency');
    }
    if (dailyAverage['vitaminA']! < requirements['vitaminA']!) {
      deficiencies.add('Vitamin A deficiency');
    }
    if (dailyAverage['calcium']! < requirements['calcium']!) {
      deficiencies.add('Calcium deficiency');
    }
    
    return deficiencies;
  }

  static String _assessNutritionRisk(List<String> deficiencies) {
    if (deficiencies.isEmpty) return 'Low';
    if (deficiencies.length <= 2) return 'Medium';
    return 'High';
  }

  static Map<String, dynamic> _assessMalnutrition(Screening screening, int ageInMonths) {
    final heightForAge = _calculateZScore(screening.height, ageInMonths, 'height');
    final weightForHeight = _calculateZScore(screening.weight, screening.height, 'weight');
    final weightForAge = _calculateZScore(screening.weight, ageInMonths, 'weight');
    
    bool isMalnourished = false;
    String severity = 'none';
    
    if (heightForAge < -2 || weightForHeight < -2 || weightForAge < -2) {
      isMalnourished = true;
      
      if (heightForAge < -3 || weightForHeight < -3 || weightForAge < -3) {
        severity = 'severe';
      } else {
        severity = 'moderate';
      }
    }
    
    return {
      'isMalnourished': isMalnourished,
      'severity': severity,
      'heightForAgeZScore': heightForAge,
      'weightForHeightZScore': weightForHeight,
      'weightForAgeZScore': weightForAge,
    };
  }

  static double _calculateZScore(double measurement, dynamic reference, String type) {
    // Simplified WHO z-score calculation
    // In production, use proper WHO reference tables
    if (type == 'height' && reference is int) {
      // Height-for-age
      final median = 50 + (reference * 2.5); // Simplified
      return (measurement - median) / 5; // Simplified standard deviation
    }
    
    if (type == 'weight' && reference is double) {
      // Weight-for-height
      final median = 10 + (reference * 0.3); // Simplified
      return (measurement - median) / 2; // Simplified standard deviation
    }
    
    if (type == 'weight' && reference is int) {
      // Weight-for-age
      final median = 3 + (reference * 0.5); // Simplified
      return (measurement - median) / 1; // Simplified standard deviation
    }
    
    return 0;
  }

  static Map<String, dynamic> _createScreeningSummary(List<Screening> screenings, List<Child> children) {
    final screenedChildren = screenings.map((s) => s.childId).toSet();
    final totalChildren = children.length;
    final screenedCount = screenedChildren.length;
    
    final malnourishedCount = screenings.where((s) {
      final child = children.firstWhere((c) => c.id == s.childId);
      final ageInMonths = _calculateAgeInMonths(child.dateOfBirth, s.date);
      final status = _assessMalnutrition(s, ageInMonths);
      return status['isMalnourished'];
    }).length;
    
    return {
      'totalChildren': totalChildren,
      'screenedChildren': screenedCount,
      'screeningCoverage': totalChildren > 0 ? (screenedCount / totalChildren * 100) : 0,
      'malnourishedChildren': malnourishedCount,
      'malnutritionRate': screenedCount > 0 ? (malnourishedCount / screenedCount * 100) : 0,
    };
  }

  static Map<String, dynamic> _groupMalnutritionByCategory(Map<String, Map<String, dynamic>> malnourished) {
    final categories = {
      'wasting': 0,
      'stunting': 0,
      'underweight': 0,
      'severe': 0,
    };
    
    for (final entry in malnourished.values) {
      final status = entry['status'] as Map<String, dynamic>;
      
      if (status['weightForHeightZScore'] < -2) categories['wasting'] = (categories['wasting'] ?? 0) + 1;
      if (status['heightForAgeZScore'] < -2) categories['stunting'] = (categories['stunting'] ?? 0) + 1;
      if (status['weightForAgeZScore'] < -2) categories['underweight'] = (categories['underweight'] ?? 0) + 1;
      if (status['severity'] == 'severe') categories['severe'] = (categories['severe'] ?? 0) + 1;
    }
    
    return categories;
  }

  static Map<String, dynamic> _groupMalnutritionByZone(Map<String, Map<String, dynamic>> malnourished) {
    final zones = <String, int>{};
    
    for (final entry in malnourished.values) {
      final child = entry['child'] as Child;
      zones[child.zone] = (zones[child.zone] ?? 0) + 1;
    }
    
    return zones;
  }

  static Map<String, dynamic> _groupMalnutritionByAgeGroup(Map<String, Map<String, dynamic>> malnourished) {
    final ageGroups = {
      '0-6 months': 0,
      '6-12 months': 0,
      '12-24 months': 0,
      '24-36 months': 0,
      '36+ months': 0,
    };
    
    for (final entry in malnourished.values) {
      final child = entry['child'] as Child;
      final screening = entry['screening'] as Screening;
      final ageInMonths = _calculateAgeInMonths(child.dateOfBirth, screening.date);
      
      if (ageInMonths < 6) {
        ageGroups['0-6 months'] = (ageGroups['0-6 months'] ?? 0) + 1;
      } else if (ageInMonths < 12) {
        ageGroups['6-12 months'] = (ageGroups['6-12 months'] ?? 0) + 1;
      } else if (ageInMonths < 24) {
        ageGroups['12-24 months'] = (ageGroups['12-24 months'] ?? 0) + 1;
      } else if (ageInMonths < 36) {
        ageGroups['24-36 months'] = (ageGroups['24-36 months'] ?? 0) + 1;
      } else {
        ageGroups['36+ months'] = (ageGroups['36+ months'] ?? 0) + 1;
      }
    }
    
    return ageGroups;
  }

  static List<String> _generateRecommendations(
    List<Child> children,
    List<Screening> screenings,
    List<DietRecord> dietRecords,
  ) {
    final recommendations = <String>[];
    
    // General recommendations based on analysis
    final malnutritionAnalysis = analyzeMalnutrition(children, screenings);
    final nutritionAnalysis = analyzeNutrition(dietRecords, children);
    
    if (malnutritionAnalysis['malnutritionRate'] > 10) {
      recommendations.add('High malnutrition rate detected. Consider nutrition education programs.');
    }
    
    if (malnutritionAnalysis['screeningCoverage'] < 80) {
      recommendations.add('Low screening coverage. Increase community outreach efforts.');
    }
    
    // Zone-specific recommendations
    final zoneSummary = getZoneScreeningSummary(children, screenings);
    for (final zone in zoneSummary.keys) {
      final summary = zoneSummary[zone];
      if (summary['malnutritionRate'] > 15) {
        recommendations.add('Focus nutrition interventions in $zone zone.');
      }
    }
    
    // Nutrition-specific recommendations
    for (final childId in nutritionAnalysis.keys) {
      final analysis = nutritionAnalysis[childId];
      if (analysis['riskLevel'] == 'High') {
        recommendations.add('Immediate nutrition counseling needed for ${analysis['childName']}.');
      }
    }
    
    return recommendations;
  }
}
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/analytics_service.dart';
import '../models/child.dart';
import '../models/screening.dart';
import '../models/diet_record.dart';

class AnalyticsState {
  final bool isLoading;
  final Map<String, dynamic>? growthAnalysis;
  final Map<String, dynamic>? nutritionAnalysis;
  final Map<String, dynamic>? malnutritionAnalysis;
  final Map<String, dynamic>? zoneSummary;
  final Map<String, dynamic>? comprehensiveReport;
  final String? error;

  const AnalyticsState({
    this.isLoading = false,
    this.growthAnalysis,
    this.nutritionAnalysis,
    this.malnutritionAnalysis,
    this.zoneSummary,
    this.comprehensiveReport,
    this.error,
  });

  AnalyticsState copyWith({
    bool? isLoading,
    Map<String, dynamic>? growthAnalysis,
    Map<String, dynamic>? nutritionAnalysis,
    Map<String, dynamic>? malnutritionAnalysis,
    Map<String, dynamic>? zoneSummary,
    Map<String, dynamic>? comprehensiveReport,
    String? error,
  }) {
    return AnalyticsState(
      isLoading: isLoading ?? this.isLoading,
      growthAnalysis: growthAnalysis ?? this.growthAnalysis,
      nutritionAnalysis: nutritionAnalysis ?? this.nutritionAnalysis,
      malnutritionAnalysis: malnutritionAnalysis ?? this.malnutritionAnalysis,
      zoneSummary: zoneSummary ?? this.zoneSummary,
      comprehensiveReport: comprehensiveReport ?? this.comprehensiveReport,
      error: error ?? this.error,
    );
  }
}

class AnalyticsNotifier extends StateNotifier<AnalyticsState> {
  AnalyticsNotifier() : super(const AnalyticsState());

  Future<void> loadAnalytics({
    required List<Child> children,
    required List<Screening> screenings,
    required List<DietRecord> dietRecords,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final growthAnalysis = AnalyticsService.analyzeGrowthTrends(children, screenings);
      final nutritionAnalysis = AnalyticsService.analyzeNutrition(dietRecords, children);
      final malnutritionAnalysis = AnalyticsService.analyzeMalnutrition(children, screenings);
      final zoneSummary = AnalyticsService.getZoneScreeningSummary(children, screenings);
      final comprehensiveReport = AnalyticsService.generateComprehensiveReport(
        children: children,
        screenings: screenings,
        dietRecords: dietRecords,
        startDate: startDate,
        endDate: endDate,
      );

      state = state.copyWith(
        isLoading: false,
        growthAnalysis: growthAnalysis,
        nutritionAnalysis: nutritionAnalysis,
        malnutritionAnalysis: malnutritionAnalysis,
        zoneSummary: zoneSummary,
        comprehensiveReport: comprehensiveReport,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load analytics: ${e.toString()}',
      );
    }
  }

  Future<void> refreshAnalytics({
    required List<Child> children,
    required List<Screening> screenings,
    required List<DietRecord> dietRecords,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    await loadAnalytics(
      children: children,
      screenings: screenings,
      dietRecords: dietRecords,
      startDate: startDate,
      endDate: endDate,
    );
  }

  void clearAnalytics() {
    state = const AnalyticsState();
  }
}

final analyticsProvider = StateNotifierProvider<AnalyticsNotifier, AnalyticsState>((ref) {
  return AnalyticsNotifier();
});

// Provider for specific analytics views
final growthAnalysisProvider = Provider<Map<String, dynamic>?>((ref) {
  return ref.watch(analyticsProvider).growthAnalysis;
});

final nutritionAnalysisProvider = Provider<Map<String, dynamic>?>((ref) {
  return ref.watch(analyticsProvider).nutritionAnalysis;
});

final malnutritionAnalysisProvider = Provider<Map<String, dynamic>?>((ref) {
  return ref.watch(analyticsProvider).malnutritionAnalysis;
});

final zoneSummaryProvider = Provider<Map<String, dynamic>?>((ref) {
  return ref.watch(analyticsProvider).zoneSummary;
});

final comprehensiveReportProvider = Provider<Map<String, dynamic>?>((ref) {
  return ref.watch(analyticsProvider).comprehensiveReport;
});
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/analytics_provider.dart';
import '../providers/children_provider.dart';
import '../providers/screenings_provider.dart';
import '../providers/diet_provider.dart';
import '../widgets/analytics_widgets.dart';

class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  DateTime? _startDate;
  DateTime? _endDate;
  String _selectedReportType = 'overview';

  @override
  void initState() {
    super.initState();
    _loadAnalytics();
  }

  Future<void> _loadAnalytics() async {
    final children = ref.read(childrenProvider).value ?? [];
    final screenings = ref.read(screeningsProvider).value ?? [];
    final dietRecords = ref.read(dietProvider).value ?? [];

    await ref.read(analyticsProvider.notifier).loadAnalytics(
      children: children,
      screenings: screenings,
      dietRecords: dietRecords,
      startDate: _startDate,
      endDate: _endDate,
    );
  }

  Future<void> _refreshAnalytics() async {
    final children = ref.read(childrenProvider).value ?? [];
    final screenings = ref.read(screeningsProvider).value ?? [];
    final dietRecords = ref.read(dietProvider).value ?? [];

    await ref.read(analyticsProvider.notifier).refreshAnalytics(
      children: children,
      screenings: screenings,
      dietRecords: dietRecords,
      startDate: _startDate,
      endDate: _endDate,
    );
  }

  Future<void> _selectDateRange() async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      initialDateRange: _startDate != null && _endDate != null
          ? DateTimeRange(start: _startDate!, end: _endDate!)
          : null,
    );

    if (picked != null) {
      setState(() {
        _startDate = picked.start;
        _endDate = picked.end;
      });
      await _loadAnalytics();
    }
  }

  @override
  Widget build(BuildContext context) {
    final analyticsState = ref.watch(analyticsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Analytics & Reports'),
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_today),
            onPressed: _selectDateRange,
            tooltip: 'Select Date Range',
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshAnalytics,
            tooltip: 'Refresh Data',
          ),
        ],
      ),
      body: analyticsState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : analyticsState.error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 64, color: Colors.red),
                      const SizedBox(height: 16),
                      Text(
                        analyticsState.error!,
                        style: Theme.of(context).textTheme.titleMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadAnalytics,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _buildReportContent(analyticsState),
    );
  }

  Widget _buildReportContent(AnalyticsState state) {
    final report = state.comprehensiveReport;
    if (report == null) {
      return const Center(child: Text('No data available'));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildReportTypeSelector(),
          const SizedBox(height: 16),
          _buildReportHeader(report),
          const SizedBox(height: 16),
          _buildReportContent(report),
        ],
      ),
    );
  }

  Widget _buildReportTypeSelector() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Row(
          children: [
            const Text('Report Type:'),
            const SizedBox(width: 16),
            Expanded(
              child: DropdownButton<String>(
                value: _selectedReportType,
                isExpanded: true,
                items: const [
                  DropdownMenuItem(value: 'overview', child: Text('Overview')),
                  DropdownMenuItem(value: 'growth', child: Text('Growth Analysis')),
                  DropdownMenuItem(value: 'nutrition', child: Text('Nutrition Analysis')),
                  DropdownMenuItem(value: 'malnutrition', child: Text('Malnutrition Report')),
                  DropdownMenuItem(value: 'zones', child: Text('Zone Summary')),
                ],
                onChanged: (value) {
                  setState(() {
                    _selectedReportType = value!;
                  });
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReportHeader(Map<String, dynamic> report) {
    final period = report['period'] as Map<String, dynamic>;
    final overview = report['overview'] as Map<String, dynamic>;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Report Summary',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'Period: ${period['start'].toString().substring(0, 10)} - ${period['end'].toString().substring(0, 10)}',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatCard('Total Children', overview['totalChildren'].toString(), Icons.people),
                _buildStatCard('Screened', overview['screenedInPeriod'].toString(), Icons.favorite),
                _buildStatCard('Diet Records', overview['totalDietRecords'].toString(), Icons.restaurant),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, size: 32, color: Theme.of(context).primaryColor),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        Text(
          title,
          style: const TextStyle(fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildReportContent(Map<String, dynamic> report) {
    switch (_selectedReportType) {
      case 'overview':
        return OverviewReport(report: report);
      case 'growth':
        return GrowthAnalysisReport(report: report['growthAnalysis']);
      case 'nutrition':
        return NutritionAnalysisReport(report: report['nutritionAnalysis']);
      case 'malnutrition':
        return MalnutritionReport(report: report['malnutritionAnalysis']);
      case 'zones':
        return ZoneSummaryReport(report: report['zoneSummary']);
      default:
        return OverviewReport(report: report);
    }
  }
}
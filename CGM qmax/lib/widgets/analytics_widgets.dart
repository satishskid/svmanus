import 'package:flutter/material.dart';
import 'package:charts_flutter/flutter.dart' as charts;

class OverviewReport extends StatelessWidget {
  final Map<String, dynamic> report;

  const OverviewReport({super.key, required this.report});

  @override
  Widget build(BuildContext context) {
    final malnutrition = report['malnutritionAnalysis'] as Map<String, dynamic>;
    final recommendations = report['recommendations'] as List<String>;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildMalnutritionCard(malnutrition),
        const SizedBox(height: 16),
        _buildRecommendationsCard(recommendations),
      ],
    );
  }

  Widget _buildMalnutritionCard(Map<String, dynamic> malnutrition) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Malnutrition Overview',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildMetricCard(
                  'Total Children',
                  malnutrition['totalChildren'].toString(),
                  Colors.blue,
                ),
                _buildMetricCard(
                  'Screened',
                  '${malnutrition['screenedChildren']}',
                  Colors.green,
                ),
                _buildMetricCard(
                  'Coverage',
                  '${malnutrition['screeningCoverage'].toStringAsFixed(1)}%',
                  Colors.orange,
                ),
                _buildMetricCard(
                  'Malnourished',
                  '${malnutrition['malnourishedChildren']}',
                  Colors.red,
                ),
                _buildMetricCard(
                  'Rate',
                  '${malnutrition['malnutritionRate'].toStringAsFixed(1)}%',
                  Colors.red,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }

  Widget _buildRecommendationsCard(List<String> recommendations) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Recommendations',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            ...recommendations.map((rec) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.circle, size: 8, color: Colors.blue),
                  const SizedBox(width: 8),
                  Expanded(child: Text(rec)),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}

class GrowthAnalysisReport extends StatelessWidget {
  final Map<String, dynamic> growthAnalysis;

  const GrowthAnalysisReport({super.key, required this.growthAnalysis});

  @override
  Widget build(BuildContext context) {
    if (growthAnalysis.isEmpty) {
      return const Center(child: Text('No growth data available'));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ...growthAnalysis.entries.map((entry) => 
          _buildChildGrowthCard(entry.key, entry.value)
        ).toList(),
      ],
    );
  }

  Widget _buildChildGrowthCard(String childId, Map<String, dynamic> data) {
    final heightData = data['heightTrend'] as List<dynamic>;
    final weightData = data['weightTrend'] as List<dynamic>;
    final bmiData = data['bmiTrend'] as List<dynamic>;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              data['childName'],
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            _buildGrowthChart('Height Trend', heightData, 'cm'),
            const SizedBox(height: 8),
            _buildGrowthChart('Weight Trend', weightData, 'kg'),
            const SizedBox(height: 8),
            _buildGrowthChart('BMI Trend', bmiData, 'kg/m²'),
          ],
        ),
      ),
    );
  }

  Widget _buildGrowthChart(String title, List<dynamic> data, String unit) {
    final series = [
      charts.Series<Map<String, dynamic>, DateTime>(
        id: title,
        data: data.cast<Map<String, dynamic>>(),
        domainFn: (datum, _) => datum['date'] as DateTime,
        measureFn: (datum, _) => 
          title == 'BMI Trend' ? datum['bmi'] as double : 
          title == 'Height Trend' ? datum['height'] as double : 
          datum['weight'] as double,
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        SizedBox(
          height: 150,
          child: charts.TimeSeriesChart(
            series,
            animate: true,
            dateTimeFactory: const charts.LocalDateTimeFactory(),
          ),
        ),
      ],
    );
  }
}

class NutritionAnalysisReport extends StatelessWidget {
  final Map<String, dynamic> nutritionAnalysis;

  const NutritionAnalysisReport({super.key, required this.nutritionAnalysis});

  @override
  Widget build(BuildContext context) {
    if (nutritionAnalysis.isEmpty) {
      return const Center(child: Text('No nutrition data available'));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ...nutritionAnalysis.entries.map((entry) => 
          _buildChildNutritionCard(entry.key, entry.value)
        ).toList(),
      ],
    );
  }

  Widget _buildChildNutritionCard(String childId, Map<String, dynamic> data) {
    final weeklySummary = data['weeklySummary'] as Map<String, dynamic>;
    final deficiencies = data['deficiencies'] as List<String>;
    final riskLevel = data['riskLevel'] as String;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  data['childName'],
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: riskLevel == 'High' ? Colors.red :
                           riskLevel == 'Medium' ? Colors.orange : Colors.green,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'Risk: $riskLevel',
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            _buildNutritionSummary(weeklySummary),
            if (deficiencies.isNotEmpty) ...[
              const SizedBox(height: 8),
              _buildDeficienciesList(deficiencies),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildNutritionSummary(Map<String, dynamic> summary) {
    final dailyAverage = summary['dailyAverage'] as Map<String, dynamic>;
    final meetingRequirements = summary['meetingRequirements'] as Map<String, dynamic>;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Daily Average Intake:', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        _buildNutrientRow('Calories', dailyAverage['calories'], meetingRequirements['calories']),
        _buildNutrientRow('Protein', dailyAverage['protein'], meetingRequirements['protein']),
        _buildNutrientRow('Iron', dailyAverage['iron'], meetingRequirements['iron']),
        _buildNutrientRow('Vitamin A', dailyAverage['vitaminA'], meetingRequirements['vitaminA']),
        _buildNutrientRow('Calcium', dailyAverage['calcium'], meetingRequirements['calcium']),
      ],
    );
  }

  Widget _buildNutrientRow(String nutrient, double value, bool meetsRequirement) {
    return Row(
      children: [
        Icon(
          meetsRequirement ? Icons.check_circle : Icons.warning,
          color: meetsRequirement ? Colors.green : Colors.orange,
          size: 16,
        ),
        const SizedBox(width: 4),
        Text('$nutrient: ${value.toStringAsFixed(1)}'),
      ],
    );
  }

  Widget _buildDeficienciesList(List<String> deficiencies) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Deficiencies:', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
        ...deficiencies.map((def) => Text('• $def')),
      ],
    );
  }
}

class MalnutritionReport extends StatelessWidget {
  final Map<String, dynamic> malnutritionAnalysis;

  const MalnutritionReport({super.key, required this.malnutritionAnalysis});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildMalnutritionCategories(malnutritionAnalysis['byCategory']),
        const SizedBox(height: 16),
        _buildAgeGroupDistribution(malnutritionAnalysis['byAgeGroup']),
        const SizedBox(height: 16),
        _buildZoneDistribution(malnutritionAnalysis['byZone']),
      ],
    );
  }

  Widget _buildMalnutritionCategories(Map<String, dynamic> categories) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Malnutrition by Category',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            ...categories.entries.map((entry) => 
              _buildCategoryRow(entry.key, entry.value as int)
            ).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryRow(String category, int count) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Expanded(child: Text(category)),
          Text('$count', style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildAgeGroupDistribution(Map<String, dynamic> ageGroups) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Age Group Distribution',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            ...ageGroups.entries.map((entry) => 
              _buildAgeGroupRow(entry.key, entry.value as int)
            ).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildAgeGroupRow(String ageGroup, int count) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Expanded(child: Text(ageGroup)),
          Text('$count', style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildZoneDistribution(Map<String, dynamic> zones) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Zone Distribution',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            ...zones.entries.map((entry) => 
              _buildZoneRow(entry.key, entry.value as int)
            ).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildZoneRow(String zone, int count) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Expanded(child: Text(zone)),
          Text('$count', style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class ZoneSummaryReport extends StatelessWidget {
  final Map<String, dynamic> zoneSummary;

  const ZoneSummaryReport({super.key, required this.zoneSummary});

  @override
  Widget build(BuildContext context) {
    if (zoneSummary.isEmpty) {
      return const Center(child: Text('No zone data available'));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ...zoneSummary.entries.map((entry) => 
          _buildZoneCard(entry.key, entry.value)
        ).toList(),
      ],
    );
  }

  Widget _buildZoneCard(String zone, Map<String, dynamic> summary) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              zone,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildMetricCard('Total', summary['totalChildren'].toString()),
                _buildMetricCard('Screened', summary['screenedChildren'].toString()),
                _buildMetricCard('Coverage', '${summary['screeningCoverage'].toStringAsFixed(1)}%'),
                _buildMetricCard('Malnourished', summary['malnourishedChildren'].toString()),
                _buildMetricCard('Rate', '${summary['malnutritionRate'].toStringAsFixed(1)}%'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}
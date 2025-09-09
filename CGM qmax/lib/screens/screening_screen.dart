import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../models/child.dart';
import '../models/screening.dart';
import '../providers/screenings_provider.dart';

class ScreeningScreen extends ConsumerStatefulWidget {
  final Child child;

  const ScreeningScreen({super.key, required this.child});

  @override
  ConsumerState<ScreeningScreen> createState() => _ScreeningScreenState();
}

class _ScreeningScreenState extends ConsumerState<ScreeningScreen> {
  final _weightController = TextEditingController();
  final _heightController = TextEditingController();
  final _muacController = TextEditingController();
  final _notesController = TextEditingController();

  String _selectedOedema = 'No';
  String _selectedSex = 'M';

  @override
  void initState() {
    super.initState();
    _selectedSex = widget.child.sex;
  }

  @override
  void dispose() {
    _weightController.dispose();
    _heightController.dispose();
    _muacController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  double _calculateWeightForAgeZScore(double weight, int ageMonths) {
    // WHO growth standards simplified calculation
    // This is a placeholder - implement actual WHO standards
    final median = ageMonths < 12 ? 9.5 : 12.5;
    final sd = ageMonths < 12 ? 1.2 : 1.5;
    return (weight - median) / sd;
  }

  double _calculateHeightForAgeZScore(double height, int ageMonths) {
    // WHO growth standards simplified calculation
    // This is a placeholder - implement actual WHO standards
    final median = ageMonths < 12 ? 75.0 : 85.0;
    final sd = ageMonths < 12 ? 3.0 : 4.0;
    return (height - median) / sd;
  }

  double _calculateWeightForHeightZScore(double weight, double height) {
    // WHO growth standards simplified calculation
    // This is a placeholder - implement actual WHO standards
    final median = height < 80 ? 10.0 : 12.0;
    final sd = height < 80 ? 1.0 : 1.2;
    return (weight - median) / sd;
  }

  String _classifyMalnutrition(double waz, double haz, double whz, double muac) {
    if (waz < -3 || haz < -3 || whz < -3 || muac < 11.5) {
      return 'Severe Acute Malnutrition';
    } else if (waz < -2 || haz < -2 || whz < -2 || muac < 12.5) {
      return 'Moderate Acute Malnutrition';
    } else {
      return 'Normal';
    }
  }

  void _saveScreening() {
    if (_weightController.text.isEmpty || 
        _heightController.text.isEmpty || 
        _muacController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all required fields')),
      );
      return;
    }

    final weight = double.tryParse(_weightController.text) ?? 0.0;
    final height = double.tryParse(_heightController.text) ?? 0.0;
    final muac = double.tryParse(_muacController.text) ?? 0.0;

    final waz = _calculateWeightForAgeZScore(weight, widget.child.ageMonths);
    final haz = _calculateHeightForAgeZScore(height, widget.child.ageMonths);
    final whz = _calculateWeightForHeightZScore(weight, height);
    final classification = _classifyMalnutrition(waz, haz, whz, muac);

    final screening = Screening(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      childId: widget.child.id,
      date: DateTime.now(),
      weight: weight,
      height: height,
      muac: muac,
      weightForAgeZScore: waz,
      heightForAgeZScore: haz,
      weightForHeightZScore: whz,
      oedema: _selectedOedema,
      classification: classification,
      notes: _notesController.text,
      workerId: 'current_worker', // Should come from auth
    );

    ref.read(screeningsProvider.notifier).addScreening(screening);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Screening saved: $classification')),
    );

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Screening: ${widget.child.name}'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Child Information',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text('Name: ${widget.child.name}'),
                    Text('ID: ${widget.child.id}'),
                    Text('Age: ${widget.child.ageMonths} months'),
                    Text('Sex: ${widget.child.sex}'),
                    Text('Zone: ${widget.child.zone}'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Measurements',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _weightController,
                      decoration: const InputDecoration(
                        labelText: 'Weight (kg) *',
                        border: OutlineInputBorder(),
                        suffixText: 'kg',
                      ),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _heightController,
                      decoration: const InputDecoration(
                        labelText: 'Height (cm) *',
                        border: OutlineInputBorder(),
                        suffixText: 'cm',
                      ),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _muacController,
                      decoration: const InputDecoration(
                        labelText: 'MUAC (cm) *',
                        border: OutlineInputBorder(),
                        suffixText: 'cm',
                        helperText: 'Mid-Upper Arm Circumference',
                      ),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _selectedOedema,
                      decoration: const InputDecoration(
                        labelText: 'Oedema',
                        border: OutlineInputBorder(),
                      ),
                      items: ['No', 'Yes']
                          .map((value) => DropdownMenuItem(
                                value: value,
                                child: Text(value),
                              ))
                          .toList(),
                      onChanged: (value) {
                        setState(() => _selectedOedema = value!);
                      },
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _notesController,
                      decoration: const InputDecoration(
                        labelText: 'Notes',
                        border: OutlineInputBorder(),
                        alignLabelWithHint: true,
                      ),
                      maxLines: 3,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _saveScreening,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text(
                  'Save Screening',
                  style: TextStyle(fontSize: 18),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
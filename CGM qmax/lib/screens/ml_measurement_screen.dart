import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../services/ml_service.dart';
import '../services/muac_ml_service.dart';
import '../providers/children_provider.dart';
import '../models/child.dart';

class MLMeasurementScreen extends StatefulWidget {
  final Child child;
  
  const MLMeasurementScreen({Key? key, required this.child}) : super(key: key);

  @override
  _MLMeasurementScreenState createState() => _MLMeasurementScreenState();
}

class _MLMeasurementScreenState extends State<MLMeasurementScreen> {
  final MLService _mlService = MLService();
  final MuacMlService _muacService = MuacMlService();
  final ImagePicker _picker = ImagePicker();
  
  File? _heightImage;
  File? _weightImage;
  File? _muacImage;
  double? _estimatedHeight;
  double? _estimatedWeight;
  double? _muacMeasurement;
  String? _bmiClassification;
  double? _zScore;
  
  bool _isProcessing = false;
  final _referenceHeightController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _mlService.initialize();
    _muacService.initialize();
  }

  @override
  void dispose() {
    _mlService.dispose();
    _muacService.dispose();
    _referenceHeightController.dispose();
    super.dispose();
  }

  Future<void> _captureHeightPhoto() async {
    final XFile? photo = await _picker.pickImage(source: ImageSource.camera);
    if (photo != null) {
      setState(() {
        _heightImage = File(photo.path);
      });
    }
  }

  Future<void> _captureWeightPhoto() async {
    final XFile? photo = await _picker.pickImage(source: ImageSource.camera);
    if (photo != null) {
      setState(() {
        _weightImage = File(photo.path);
      });
    }
  }

  Future<void> _estimateHeight() async {
    if (_heightImage == null || _referenceHeightController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please capture photo and enter reference height')),
      );
      return;
    }

    setState(() {
      _isProcessing = true;
    });

    try {
      final referenceHeight = double.tryParse(_referenceHeightController.text) ?? 0.0;
      final height = await _mlService.estimateHeightFromImage(_heightImage!, referenceHeight);
      
      setState(() {
        _estimatedHeight = height;
        _isProcessing = false;
      });

      if (_estimatedWeight != null) {
        await _classifyBMI();
      }
    } catch (e) {
      setState(() {
        _isProcessing = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error estimating height: $e')),
      );
    }
  }

  Future<void> _estimateWeight() async {
    if (_weightImage == null || _estimatedHeight == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please capture photo and estimate height first')),
      );
      return;
    }

    setState(() {
      _isProcessing = true;
    });

    try {
      final weight = await _mlService.estimateWeightFromImage(_weightImage!, _estimatedHeight!);
      
      setState(() {
        _estimatedWeight = weight;
        _isProcessing = false;
      });

      await _classifyBMI();
    } catch (e) {
      setState(() {
        _isProcessing = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error estimating weight: $e')),
      );
    }
  }

  Future<void> _classifyBMI() async {
    if (_estimatedHeight == null || _estimatedWeight == null) return;

    final classification = await _mlService.classifyBMI(
      _estimatedHeight!,
      _estimatedWeight!,
      widget.child.age,
    );

    final zScore = await _mlService.calculateZScore(
      _estimatedHeight!,
      _estimatedWeight!,
      widget.child.age,
      widget.child.sex,
    );

    setState(() {
      _bmiClassification = classification;
      _zScore = zScore;
    });
  }

  Future<void> _captureMuacPhoto() async {
    final XFile? photo = await _picker.pickImage(source: ImageSource.camera);
    if (photo != null) {
      setState(() {
        _muacImage = File(photo.path);
        _muacMeasurement = null;
      });
    }
  }

  Future<void> _measureMuac() async {
    if (_muacImage == null) return;

    setState(() {
      _isProcessing = true;
    });

    try {
      final result = await _muacService.measureMuacFromImage(_muacImage!);
      
      setState(() {
        _isProcessing = false;
        if (result.success) {
          _muacMeasurement = result.measurement;
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(result.error ?? 'Failed to measure MUAC')),
          );
        }
      });
    } catch (e) {
      setState(() {
        _isProcessing = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error measuring MUAC: $e')),
      );
    }
  }

  void _saveMeasurements() {
    if (_estimatedHeight == null || _estimatedWeight == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete measurements first')),
      );
      return;
    }

    // Save to provider
    final childrenProvider = Provider.of<ChildrenProvider>(context, listen: false);
    
    // Create updated child with measurements
    final updatedChild = widget.child.copyWith(
      height: _estimatedHeight,
      weight: _estimatedWeight,
      lastUpdated: DateTime.now(),
    );

    childrenProvider.updateChild(updatedChild);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Measurements saved successfully')),
    );

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Measure ${widget.child.name}'),
        backgroundColor: Theme.of(context).primaryColor,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Child Info Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.child.name,
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    Text('Age: ${widget.child.age} months'),
                    Text('Sex: ${widget.child.sex}'),
                    Text('Zone: ${widget.child.zone}'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Height Measurement Section
            Text(
              'Height Measurement',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                ElevatedButton.icon(
                  onPressed: _captureHeightPhoto,
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('Capture Photo'),
                ),
                const SizedBox(width: 16),
                if (_heightImage != null)
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Image.file(_heightImage!, fit: BoxFit.cover),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _referenceHeightController,
              decoration: const InputDecoration(
                labelText: 'Reference Object Height (cm)',
                suffixText: 'cm',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: _isProcessing ? null : _estimateHeight,
              child: _isProcessing
                  ? const CircularProgressIndicator()
                  : const Text('Estimate Height'),
            ),
            if (_estimatedHeight != null)
              Text(
                'Estimated Height: ${_estimatedHeight!.toStringAsFixed(1)} cm',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            const SizedBox(height: 20),

            // Weight Measurement Section
            Text(
              'Weight Measurement',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                ElevatedButton.icon(
                  onPressed: _captureWeightPhoto,
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('Capture Photo'),
                ),
                const SizedBox(width: 16),
                if (_weightImage != null)
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Image.file(_weightImage!, fit: BoxFit.cover),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: _isProcessing ? null : _estimateWeight,
              child: _isProcessing
                  ? const CircularProgressIndicator()
                  : const Text('Estimate Weight'),
            ),
            if (_estimatedWeight != null)
              Text(
                'Estimated Weight: ${_estimatedWeight!.toStringAsFixed(1)} kg',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            const SizedBox(height: 20),

            // MUAC Measurement Section
            Text(
              'MUAC Measurement',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                ElevatedButton.icon(
                  onPressed: _captureMuacPhoto,
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('Capture MUAC Photo'),
                ),
                const SizedBox(width: 16),
                if (_muacImage != null)
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Image.file(_muacImage!, fit: BoxFit.cover),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: _isProcessing ? null : _measureMuac,
              child: _isProcessing
                  ? const CircularProgressIndicator()
                  : const Text('Measure MUAC'),
            ),
            if (_muacMeasurement != null)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'MUAC: ${_muacMeasurement!.toStringAsFixed(1)} cm',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  _buildMuacInterpretation(_muacMeasurement!),
                ],
              ),
            const SizedBox(height: 20),

            // Results Section
            if (_bmiClassification != null && _zScore != null)
              Card(
                color: _getBMIColor(_bmiClassification!),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Nutritional Status',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.white),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Classification: $_bmiClassification',
                        style: const TextStyle(color: Colors.white, fontSize: 16),
                      ),
                      Text(
                        'Z-Score: ${_zScore!.toStringAsFixed(2)}',
                        style: const TextStyle(color: Colors.white, fontSize: 16),
                      ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 20),

            // Manual Override Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Manual Override',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            decoration: const InputDecoration(
                              labelText: 'Manual Height (cm)',
                              border: OutlineInputBorder(),
                            ),
                            keyboardType: TextInputType.number,
                            onChanged: (value) {
                              setState(() {
                                _estimatedHeight = double.tryParse(value);
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            decoration: const InputDecoration(
                              labelText: 'Manual Weight (kg)',
                              border: OutlineInputBorder(),
                            ),
                            keyboardType: TextInputType.number,
                            onChanged: (value) {
                              setState(() {
                                _estimatedWeight = double.tryParse(value);
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            decoration: const InputDecoration(
                              labelText: 'Manual MUAC (cm)',
                              border: OutlineInputBorder(),
                            ),
                            keyboardType: TextInputType.number,
                            onChanged: (value) {
                              setState(() {
                                _muacMeasurement = double.tryParse(value);
                              });
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Save Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _saveMeasurements,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Save Measurements'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getBMIColor(String classification) {
    switch (classification) {
      case 'Underweight':
        return Colors.orange;
      case 'Normal':
        return Colors.green;
      case 'Overweight':
        return Colors.red;
      default:
        return Colors.blue;
    }
  }

  Widget _buildMuacInterpretation(double measurement) {
    String interpretation;
    Color color;
    
    if (measurement < 11.5) {
      interpretation = 'Severe Acute Malnutrition';
      color = Colors.red;
    } else if (measurement < 12.5) {
      interpretation = 'Moderate Acute Malnutrition';
      color = Colors.orange;
    } else if (measurement < 13.5) {
      interpretation = 'At Risk';
      color = Colors.yellow;
    } else {
      interpretation = 'Normal';
      color = Colors.green;
    }

    return Container(
      padding: const EdgeInsets.all(8),
      margin: const EdgeInsets.only(top: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color),
      ),
      child: Text(
        interpretation,
        style: TextStyle(color: color, fontWeight: FontWeight.bold),
      ),
    );
  }
}
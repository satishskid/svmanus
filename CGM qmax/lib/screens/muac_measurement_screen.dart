import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import '../services/muac_ml_service.dart';

class MuacMeasurementScreen extends StatefulWidget {
  final Function(double) onMeasurementComplete;

  const MuacMeasurementScreen({
    Key? key,
    required this.onMeasurementComplete,
  }) : super(key: key);

  @override
  State<MuacMeasurementScreen> createState() => _MuacMeasurementScreenState();
}

class _MuacMeasurementScreenState extends State<MuacMeasurementScreen> {
  final MuacMlService _muacService = MuacMlService();
  final ImagePicker _imagePicker = ImagePicker();
  
  File? _selectedImage;
  bool _isProcessing = false;
  double? _muacMeasurement;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _initializeService();
  }

  Future<void> _initializeService() async {
    try {
      await _muacService.initialize();
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to initialize MUAC measurement service';
      });
    }
  }

  @override
  void dispose() {
    _muacService.dispose();
    super.dispose();
  }

  Future<void> _requestPermissions() async {
    final status = await Permission.camera.request();
    if (status.isDenied) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Camera permission required for MUAC measurement')),
      );
    }
  }

  Future<void> _takePhoto() async {
    await _requestPermissions();
    
    final XFile? photo = await _imagePicker.pickImage(
      source: ImageSource.camera,
      preferredCameraDevice: CameraDevice.rear,
      imageQuality: 90,
    );

    if (photo != null) {
      setState(() {
        _selectedImage = File(photo.path);
        _muacMeasurement = null;
        _errorMessage = null;
      });
    }
  }

  Future<void> _selectFromGallery() async {
    final XFile? image = await _imagePicker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 90,
    );

    if (image != null) {
      setState(() {
        _selectedImage = File(image.path);
        _muacMeasurement = null;
        _errorMessage = null;
      });
    }
  }

  Future<void> _measureMuac() async {
    if (_selectedImage == null) return;

    setState(() {
      _isProcessing = true;
      _errorMessage = null;
    });

    try {
      final result = await _muacService.measureMuacFromImage(_selectedImage!);
      
      setState(() {
        _isProcessing = false;
        if (result.success) {
          _muacMeasurement = result.measurement;
        } else {
          _errorMessage = result.error;
        }
      });
    } catch (e) {
      setState(() {
        _isProcessing = false;
        _errorMessage = 'Error measuring MUAC: ${e.toString()}';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('MUAC Measurement'),
        backgroundColor: Theme.of(context).primaryColor,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildInstructionsCard(),
            const SizedBox(height: 16),
            _buildPhotoSection(),
            const SizedBox(height: 16),
            _buildMeasurementSection(),
            const SizedBox(height: 16),
            _buildActionButtons(),
          ],
        ),
      ),
    );
  }

  Widget _buildInstructionsCard() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'MUAC Measurement Instructions',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text('1. Place MUAC tape around child\'s left upper arm'),
            Text('2. Position midway between shoulder and elbow'),
            Text('3. Ensure arm is relaxed and hanging naturally'),
            Text('4. Take photo from 50cm distance, perpendicular to arm'),
            Text('5. Ensure good lighting and clear view of tape'),
          ],
        ),
      ),
    );
  }

  Widget _buildPhotoSection() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            if (_selectedImage != null)
              Container(
                height: 200,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  image: DecorationImage(
                    image: FileImage(_selectedImage!),
                    fit: BoxFit.cover,
                  ),
                ),
              )
            else
              Container(
                height: 200,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey),
                ),
                child: const Center(
                  child: Icon(Icons.camera_alt, size: 48, color: Colors.grey),
                ),
              ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton.icon(
                  onPressed: _takePhoto,
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('Take Photo'),
                ),
                ElevatedButton.icon(
                  onPressed: _selectFromGallery,
                  icon: const Icon(Icons.photo_library),
                  label: const Text('From Gallery'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMeasurementSection() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            if (_isProcessing)
              const CircularProgressIndicator()
            else if (_muacMeasurement != null)
              Column(
                children: [
                  const Text(
                    'MUAC Measurement',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${_muacMeasurement!.toStringAsFixed(1)} cm',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.green,
                    ),
                  ),
                  const SizedBox(height: 8),
                  _buildMuacInterpretation(_muacMeasurement!),
                ],
              )
            else if (_errorMessage != null)
              Column(
                children: [
                  const Icon(Icons.error, color: Colors.red, size: 48),
                  const SizedBox(height: 8),
                  Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                ],
              )
            else
              const Text('Take or select a photo to measure MUAC'),
          ],
        ),
      ),
    );
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
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        interpretation,
        style: TextStyle(color: color, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildActionButtons() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (_selectedImage != null && !_isProcessing)
          ElevatedButton(
            onPressed: _measureMuac,
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).primaryColor,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: const Text(
              'Measure MUAC',
              style: TextStyle(fontSize: 16),
            ),
          ),
        const SizedBox(height: 8),
        if (_muacMeasurement != null)
          ElevatedButton(
            onPressed: () {
              widget.onMeasurementComplete(_muacMeasurement!);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: const Text(
              'Use This Measurement',
              style: TextStyle(fontSize: 16),
            ),
          ),
      ],
    );
  }
}
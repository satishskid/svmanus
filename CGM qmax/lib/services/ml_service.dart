import 'dart:io';
import 'dart:typed_data';
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:image/image.dart' as img;
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as path;

class MLService {
  static const String _heightModelPath = 'assets/ml_models/height_estimation.tflite';
  static const String _weightModelPath = 'assets/ml_models/weight_estimation.tflite';
  static const String _bmiModelPath = 'assets/ml_models/bmi_classification.tflite';
  
  late Interpreter _heightInterpreter;
  late Interpreter _weightInterpreter;
  late Interpreter _bmiInterpreter;
  bool _isInitialized = false;

  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      // Load models from assets
      final heightModelData = await _loadModelFromAssets(_heightModelPath);
      final weightModelData = await _loadModelFromAssets(_weightModelPath);
      final bmiModelData = await _loadModelFromAssets(_bmiModelPath);

      _heightInterpreter = Interpreter.fromBuffer(heightModelData);
      _weightInterpreter = Interpreter.fromBuffer(weightModelData);
      _bmiInterpreter = Interpreter.fromBuffer(bmiModelData);

      _isInitialized = true;
    } catch (e) {
      print('Error initializing ML models: $e');
      throw Exception('Failed to initialize ML models');
    }
  }

  Future<Uint8List> _loadModelFromAssets(String modelPath) async {
    try {
      final byteData = await File(modelPath).readAsBytes();
      return byteData.buffer.asUint8List();
    } catch (e) {
      // If file doesn't exist, return dummy data for now
      // In production, these would be actual model files
      return Uint8List(1024);
    }
  }

  Future<double> estimateHeightFromImage(File imageFile, double referenceObjectHeight) async {
    if (!_isInitialized) await initialize();

    try {
      final image = img.decodeImage(await imageFile.readAsBytes());
      if (image == null) throw Exception('Failed to decode image');

      // Preprocess image
      final preprocessedImage = _preprocessImage(image);
      
      // Prepare input tensor
      final input = _createInputTensor(preprocessedImage, referenceObjectHeight);
      final output = List<double>.filled(1, 0.0);

      // Run inference
      _heightInterpreter.run(input, output);
      
      return output[0];
    } catch (e) {
      print('Error estimating height: $e');
      return 0.0; // Fallback to manual measurement
    }
  }

  Future<double> estimateWeightFromImage(File imageFile, double height) async {
    if (!_isInitialized) await initialize();

    try {
      final image = img.decodeImage(await imageFile.readAsBytes());
      if (image == null) throw Exception('Failed to decode image');

      // Preprocess image
      final preprocessedImage = _preprocessImage(image);
      
      // Prepare input tensor with height as additional feature
      final input = _createWeightInputTensor(preprocessedImage, height);
      final output = List<double>.filled(1, 0.0);

      // Run inference
      _weightInterpreter.run(input, output);
      
      return output[0];
    } catch (e) {
      print('Error estimating weight: $e');
      return 0.0; // Fallback to manual measurement
    }
  }

  Future<String> classifyBMI(double height, double weight, int ageMonths) async {
    if (!_isInitialized) await initialize();

    try {
      // Calculate BMI
      final bmi = weight / ((height / 100) * (height / 100));
      
      // Prepare input tensor
      final input = [height, weight, ageMonths.toDouble()];
      final output = List<double>.filled(3, 0.0); // 3 classes: underweight, normal, overweight

      // Run inference
      _bmiInterpreter.run(input, output);

      // Get classification
      final maxIndex = output.indexOf(output.reduce((a, b) => a > b ? a : b));
      switch (maxIndex) {
        case 0:
          return 'Underweight';
        case 1:
          return 'Normal';
        case 2:
          return 'Overweight';
        default:
          return 'Unknown';
      }
    } catch (e) {
      print('Error classifying BMI: $e');
      return 'Manual Assessment Required';
    }
  }

  Future<double> calculateZScore(double height, double weight, int ageMonths, String sex) async {
    // WHO growth reference z-score calculation
    // This is a simplified version - in production, use WHO reference tables
    
    final bmi = weight / ((height / 100) * (height / 100));
    
    // Simplified WHO reference values (would be more complex in production)
    final whoReferences = _getWHOReferences(ageMonths, sex);
    
    if (whoReferences != null) {
      final zScore = (bmi - whoReferences['median']) / whoReferences['sd'];
      return zScore;
    }
    
    return 0.0; // Fallback
  }

  Map<String, double>? _getWHOReferences(int ageMonths, String sex) {
    // Simplified WHO reference data for demonstration
    // In production, this would use comprehensive WHO growth charts
    
    if (ageMonths >= 6 && ageMonths <= 60) {
      // Sample reference values for 24-month-old
      if (sex == 'M') {
        return {'median': 16.0, 'sd': 1.0};
      } else {
        return {'median': 15.8, 'sd': 1.1};
      }
    }
    
    return null;
  }

  List<List<List<double>>> _preprocessImage(img.Image image) {
    // Resize image to model input size (224x224 for demonstration)
    final resized = img.copyResize(image, width: 224, height: 224);
    
    // Normalize pixel values to [0, 1]
    final normalized = List.generate(224, (y) =>
      List.generate(224, (x) =>
        List.generate(3, (c) {
          final pixel = resized.getPixel(x, y);
          return pixel[c] / 255.0;
        })
      )
    );
    
    return normalized;
  }

  List<double> _createInputTensor(List<List<List<double>>> image, double referenceHeight) {
    // Flatten image and add reference height
    final flattened = image.expand((row) => row.expand((pixel) => pixel)).toList();
    flattened.add(referenceHeight);
    return flattened;
  }

  List<double> _createWeightInputTensor(List<List<List<double>>> image, double height) {
    // Flatten image and add height
    final flattened = image.expand((row) => row.expand((pixel) => pixel)).toList();
    flattened.add(height);
    return flattened;
  }

  void dispose() {
    if (_isInitialized) {
      _heightInterpreter.close();
      _weightInterpreter.close();
      _bmiInterpreter.close();
    }
  }
}
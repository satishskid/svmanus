import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:image/image.dart' as img;
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:logger/logger.dart';

class MuacMlService {
  static final Logger _logger = Logger();
  
  static const String _modelPath = 'assets/ml_models/muac_detection.tflite';
  static const String _conversionModelPath = 'assets/ml_models/arm_to_muac.tflite';
  
  Interpreter? _interpreter;
  Interpreter? _conversionInterpreter;
  bool _isInitialized = false;

  // Reference object dimensions (cm)
  static const double _referenceObjectWidth = 2.1; // Standard MUAC tape width
  static const double _referenceObjectHeight = 2.1;

  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      _interpreter = await Interpreter.fromAsset(_modelPath);
      _conversionInterpreter = await Interpreter.fromAsset(_conversionModelPath);
      _isInitialized = true;
      _logger.i('MUAC ML Service initialized successfully');
    } catch (e) {
      _logger.e('Failed to initialize MUAC ML Service: $e');
      rethrow;
    }
  }

  Future<MuacResult> measureMuacFromImage(File imageFile) async {
    if (!_isInitialized) {
      await initialize();
    }

    try {
      final imageBytes = await imageFile.readAsBytes();
      final image = img.decodeImage(imageBytes);
      
      if (image == null) {
        throw Exception('Failed to decode image');
      }

      // Preprocess image for model
      final processedImage = _preprocessImage(image);
      
      // Run arm detection model
      final armDetectionResult = await _detectArm(processedImage);
      
      if (!armDetectionResult.success) {
        return MuacResult.error('Failed to detect arm in image');
      }

      // Calculate arm circumference using conversion model
      final armCircumference = await _calculateArmCircumference(
        armDetectionResult,
        image.width,
        image.height,
      );

      // Validate measurement
      if (armCircumference < 5.0 || armCircumference > 30.0) {
        return MuacResult.error('Measurement seems unrealistic. Please retake photo.');
      }

      return MuacResult.success(armCircumference);
      
    } catch (e) {
      _logger.e('Error measuring MUAC: $e');
      return MuacResult.error('Failed to process image: ${e.toString()}');
    }
  }

  List<List<List<List<double>>>> _preprocessImage(img.Image image) {
    // Resize image to model input size (224x224)
    final resized = img.copyResize(image, width: 224, height: 224);
    
    // Normalize pixel values to [0, 1]
    final buffer = List<List<List<List<double>>>>.generate(
      1,
      (i) => List<List<List<double>>>.generate(
        224,
        (j) => List<List<double>>.generate(
          224,
          (k) {
            final pixel = resized.getPixel(k, j);
            return [
              pixel.r / 255.0,
              pixel.g / 255.0,
              pixel.b / 255.0,
            ];
          },
        ),
      ),
    );
    
    return buffer;
  }

  Future<ArmDetectionResult> _detectArm(List<List<List<List<double>>>> image) async {
    if (_interpreter == null) {
      throw Exception('Interpreter not initialized');
    }

    final input = image;
    final output = List.filled(4, 0.0).reshape([1, 4]);
    
    _interpreter!.run(input, output);
    
    final bbox = output[0] as List<double>;
    
    return ArmDetectionResult(
      x: bbox[0],
      y: bbox[1],
      width: bbox[2],
      height: bbox[3],
      confidence: bbox.reduce((a, b) => a > b ? a : b),
      success: bbox[2] > 0 && bbox[3] > 0,
    );
  }

  Future<double> _calculateArmCircumference(
    ArmDetectionResult detection,
    int imageWidth,
    int imageHeight,
  ) async {
    if (_conversionInterpreter == null) {
      throw Exception('Conversion interpreter not initialized');
    }

    // Calculate pixel-to-cm ratio using reference object
    final pixelToCmRatio = _calculatePixelToCmRatio(detection, imageWidth, imageHeight);
    
    // Calculate arm diameter in pixels
    final armDiameterPixels = detection.width * imageWidth;
    
    // Convert to cm
    final armDiameterCm = armDiameterPixels * pixelToCmRatio;
    
    // Calculate circumference (π * diameter)
    final circumference = 3.14159 * armDiameterCm;
    
    // Apply correction factor from ML model
    final correctionInput = [circumference].reshape([1, 1]);
    final correctionOutput = List.filled(1, 0.0).reshape([1, 1]);
    
    _conversionInterpreter!.run(correctionInput, correctionOutput);
    
    return correctionOutput[0][0] as double;
  }

  double _calculatePixelToCmRatio(
    ArmDetectionResult detection,
    int imageWidth,
    int imageHeight,
  ) {
    // This is a simplified calculation - in real implementation,
    // you would use computer vision to detect the reference object
    // and calculate the actual pixel-to-cm ratio
    
    // For now, we'll use a default ratio based on typical phone camera
    return 0.026; // Approximately 38 pixels per cm at 50cm distance
  }

  void dispose() {
    _interpreter?.close();
    _conversionInterpreter?.close();
    _isInitialized = false;
  }
}

class ArmDetectionResult {
  final double x;
  final double y;
  final double width;
  final double height;
  final double confidence;
  final bool success;

  ArmDetectionResult({
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    required this.confidence,
    required this.success,
  });
}

class MuacResult {
  final double? measurement;
  final String? error;
  final bool success;

  MuacResult._(this.measurement, this.error, this.success);

  factory MuacResult.success(double measurement) {
    return MuacResult._(measurement, null, true);
  }

  factory MuacResult.error(String error) {
    return MuacResult._(null, error, false);
  }
}
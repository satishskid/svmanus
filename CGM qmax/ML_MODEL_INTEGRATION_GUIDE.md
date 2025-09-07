# ML Model Integration Guide

## Overview
This guide provides instructions for replacing the placeholder TensorFlow Lite models with production-ready models for the Child Growth Monitoring (CGM) app.

## Current Placeholder Models
- `muac_detection.tflite` - Arm detection model (currently placeholder)
- `arm_to_muac.tflite` - MUAC conversion model (currently placeholder)

## Production Model Requirements

### 1. MUAC Detection Model (`muac_detection.tflite`)
**Purpose**: Detect upper arm in camera images and extract bounding box

**Model Specifications**:
- **Input**: 224×224×3 RGB image (normalized 0-1)
- **Output**: [x, y, width, height] bounding box coordinates (normalized 0-1)
- **Model Type**: Object detection (MobileNet-SSD, YOLO, or similar)
- **Classes**: Single class "upper_arm"
- **Accuracy Target**: >90% mAP on validation set

**Training Data Requirements**:
- 1000+ diverse arm images across different ages (6 months - 5 years)
- Various lighting conditions and backgrounds
- Different arm positions and orientations
- Ethnically diverse dataset
- Include edge cases (occlusions, partial views)

### 2. Arm-to-MUAC Conversion Model (`arm_to_muac.tflite`)
**Purpose**: Convert detected arm diameter to accurate MUAC measurement

**Model Specifications**:
- **Input**: Arm diameter in cm (float32)
- **Output**: Corrected MUAC circumference in cm (float32)
- **Model Type**: Regression model (linear regression, polynomial, or small neural network)
- **Accuracy Target**: ±0.5 cm error margin

**Training Data Requirements**:
- 500+ paired measurements (arm diameter vs actual MUAC)
- Age-stratified data (6-59 months)
- Include correction factors for arm shape variations
- Cross-validation with clinical measurements

## Model Training Resources

### Recommended Approaches

#### Option 1: Transfer Learning
```python
# Example TensorFlow/Keras implementation
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2

# For arm detection
base_model = MobileNetV2(weights='imagenet', include_top=False)
# Add custom detection head...
```

#### Option 2: Google AutoML Vision
- Use Google Cloud AutoML Vision for custom object detection
- Export trained model as TFLite
- Tutorial: https://cloud.google.com/vision/automl/docs

#### Option 3: TensorFlow Lite Model Maker
```python
# Example using TFLite Model Maker
import tensorflow as tf
from tflite_model_maker import object_detector

# Load training data
train_data = object_detector.DataLoader.from_pascal_voc(...)
model = object_detector.create(train_data)
model.export('muac_detection.tflite')
```

## Integration Steps

### Step 1: Prepare Production Models
1. Train or obtain pre-trained models meeting specifications
2. Convert to TensorFlow Lite format
3. Test model accuracy on validation dataset
4. Optimize for mobile deployment (quantization, pruning)

### Step 2: Replace Model Files
1. Rename production models to match placeholder names:
   - `your_model.tflite` → `muac_detection.tflite`
   - `your_conversion_model.tflite` → `arm_to_muac.tflite`

2. Copy models to `assets/ml_models/` directory:
```bash
cp production_muac_detection.tflite /Users/spr/CGM qmax/assets/ml_models/muac_detection.tflite
cp production_arm_to_muac.tflite /Users/spr/CGM qmax/assets/ml_models/arm_to_muac.tflite
```

### Step 3: Update Model Metadata
Update model information in `lib/services/muac_ml_service.dart`:
```dart
// Verify input/output shapes match your models
final inputShape = [1, 224, 224, 3];
final outputShape = [1, 4]; // For detection model
```

### Step 4: Test Integration
1. Run comprehensive tests using provided test scripts
2. Validate model accuracy with real-world data
3. Test on various devices (Android/iOS)
4. Performance testing (inference time < 200ms)

## Model Validation Checklist

### Detection Model Tests
- [ ] Model loads successfully without errors
- [ ] Detects arms in various lighting conditions
- [ ] Handles partial occlusions gracefully
- [ ] Bounding box accuracy within 10% of actual arm
- [ ] Inference time < 200ms on target devices

### Conversion Model Tests
- [ ] Accepts arm diameter input correctly
- [ ] Outputs MUAC values within ±0.5cm accuracy
- [ ] Handles edge cases (very thin/thick arms)
- [ ] Linear scaling across age ranges
- [ ] No negative or unrealistic outputs

## Performance Optimization

### Model Quantization
```python
# Example quantization for mobile deployment
converter = tf.lite.TFLiteConverter.from_saved_model(saved_model_dir)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
quantized_model = converter.convert()
```

### Size Optimization
- Target model size: < 10MB each
- Use post-training quantization
- Consider pruning for further size reduction

## Data Collection Guidelines

### For Model Improvement
1. **Collect real-world data** during app usage
2. **Anonymize all collected images**
3. **Include metadata**: age, gender, device type
4. **Regular retraining** schedule (quarterly)
5. **A/B testing** for model updates

### Privacy Considerations
- All images must be processed locally on device
- No cloud processing for arm detection
- Implement data retention policies
- GDPR/privacy law compliance

## Troubleshooting

### Common Issues
1. **Model loading fails**: Check TFLite version compatibility
2. **Low accuracy**: Verify training data quality and diversity
3. **Slow inference**: Optimize model architecture and quantization
4. **Memory issues**: Implement proper model disposal in Flutter

### Support Resources
- TensorFlow Lite documentation: https://www.tensorflow.org/lite
- Flutter TFLite plugin: https://pub.dev/packages/tflite_flutter
- Model optimization: https://www.tensorflow.org/lite/performance/post_training_quantization

## Contact & Support
For technical support with model integration, refer to:
- TensorFlow community forums
- Flutter ML community
- Project documentation in `/docs` directory

---
*Last updated: [Current Date]*
*Version: 1.0*
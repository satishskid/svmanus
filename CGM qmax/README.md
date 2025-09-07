# Child Growth Monitor (CGM) App

A comprehensive Flutter application for malnutrition screening and nutrition intelligence, designed for healthcare workers in resource-limited settings.

## 🎯 Project Overview

**CGM (Child Growth Monitor)** is a mobile-first application that enables healthcare professionals to:
- Screen children for malnutrition using WHO growth standards
- Perform MUAC (Mid-Upper Arm Circumference) measurements via photo analysis
- Track child growth patterns over time
- Generate nutrition analytics and reports
- Export/import data via Excel for zone management
- Work offline with automatic sync capabilities

## 🚀 Key Features

### 📊 **Malnutrition Screening**
- **WHO Growth Standards**: Implements WHO child growth standards for accurate assessment
- **MUAC Measurement**: AI-powered photo analysis for MUAC measurements
- **Z-Score Calculations**: Automated calculation of weight-for-age, height-for-age, and weight-for-height z-scores
- **Risk Classification**: Automatic classification into severe, moderate, or normal nutrition status

### 📱 **Mobile-First Design**
- **Offline-First**: Full functionality without internet connection
- **Multi-Language Support**: English and French localization with RTL support
- **Responsive UI**: Optimized for tablets and smartphones
- **Dark/Light Mode**: System-adaptive theme switching

### 📈 **Analytics & Reporting**
- **Real-time Dashboard**: Visual analytics with charts and graphs
- **Excel Integration**: Import/export child and screening data
- **Zone Management**: Organize data by geographical zones
- **Worker Management**: Track healthcare worker assignments and performance

### 🤖 **Machine Learning Integration**
- **Height/Weight Estimation**: ML models for body measurement estimation from photos
- **MUAC Detection**: Computer vision for accurate MUAC measurement
- **Pose Detection**: Google ML Kit integration for body landmark detection
- **Model Updates**: Support for model replacement and updates

### 🔧 **Technical Features**
- **Hive Database**: Fast, lightweight local storage with encryption
- **Riverpod State Management**: Predictable state management with code generation
- **Offline Sync**: Automatic data synchronization when online
- **CSV/PDF Export**: Generate reports in multiple formats
- **Camera Integration**: Direct photo capture with ML processing

## 🏗️ **Architecture**

### **Tech Stack**
- **Framework**: Flutter 3.35.3
- **Language**: Dart 3.9.2
- **State Management**: Riverpod + Riverpod Generator
- **Database**: Hive (with TypeAdapters)
- **ML Framework**: TensorFlow Lite + Google ML Kit
- **Charts**: Community Charts Flutter
- **Excel**: Syncfusion Flutter XlsIO
- **Localization**: Flutter Localizations + intl

### **Project Structure**
```
lib/
├── constants/          # App constants and configurations
├── l10n/              # Localization files (EN/FR)
├── models/            # Data models with Hive integration
├── providers/         # Riverpod state management
├── screens/           # UI screens and pages
├── services/          # Business logic and API services
├── utils/            # Utility functions and helpers
└── widgets/          # Reusable UI components
```

## 🛠️ **Installation & Setup**

### **Prerequisites**
- Flutter 3.35.3 or higher
- Dart 3.9.2 or higher
- Android Studio / Xcode (for mobile development)
- Chrome (for web development)

### **Quick Start**

1. **Clone the repository**
   ```bash
   git clone https://github.com/satishskid/cgmax.git
   cd cgmax
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Generate code**
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

4. **Run the app**
   ```bash
   # For mobile
   flutter run
   
   # For web
   flutter run -d chrome
   ```

### **Platform-Specific Setup**

#### **Android Setup**
```bash
flutter doctor --android-licenses
flutter build apk --release
```

#### **iOS Setup**
```bash
# On macOS
sudo gem install cocoapods
pod setup
flutter build ios --release
```

#### **Web Setup**
```bash
flutter create . --platforms web
flutter build web --release
```

## 📱 **Usage Guide**

### **Getting Started**
1. **Login**: Use the simple login screen to access the app
2. **Add Child**: Register new children with basic information
3. **Screening**: Perform malnutrition screening using:
   - Manual measurements (height, weight, age)
   - AI-powered MUAC measurement via camera
   - Photo-based height/weight estimation
4. **Analytics**: View growth trends and nutrition status
5. **Export**: Generate Excel reports for zone management

### **Data Management**
- **Offline Storage**: All data stored locally in Hive database
- **Sync**: Automatic sync when internet is available
- **Backup**: Export to Excel for data backup
- **Import**: Bulk import child data from Excel files

## 🧪 **Testing**

### **Running Tests**
```bash
# Unit tests
flutter test

# Widget tests
flutter test test/widget_test.dart

# Integration tests
flutter test integration_test/
```

### **Test Data**
- **Sample Images**: Located in `test_data/images/`
- **Test Scenarios**: Configured in `test_data/test_scenarios.json`
- **ML Models**: Placeholder models in `assets/ml_models/`

## 🔄 **Model Management**

### **ML Model Structure**
```
assets/ml_models/
├── arm_to_muac.tflite          # MUAC measurement model
├── muac_detection.tflite        # MUAC detection model
└── placeholder_models.txt       # Model documentation
```

### **Model Replacement**
Use the provided script to update ML models:
```bash
./scripts/replace_ml_models.sh
```

## 📊 **Development Workflow**

### **Code Generation**
```bash
# Generate Hive adapters
flutter pub run build_runner build

# Generate localization
flutter gen-l10n

# Generate Riverpod providers
flutter pub run build_runner watch
```

### **Building for Production**
```bash
# Android
flutter build apk --release
flutter build appbundle --release

# iOS
flutter build ios --release

# Web
flutter build web --release
```

## 🔧 **Configuration**

### **Environment Variables**
Create a `.env` file for configuration:
```env
API_BASE_URL=https://your-api-endpoint.com
SYNC_INTERVAL=300
MAX_OFFLINE_RECORDS=1000
```

### **Hive Configuration**
```dart
// Database encryption
Hive.initFlutter();
Hive.registerAdapter(ChildAdapter());
Hive.registerAdapter(ScreeningAdapter());
```

## 📈 **Performance Optimization**

### **Database Optimization**
- **Lazy Loading**: Implement pagination for large datasets
- **Indexing**: Add indexes for frequently queried fields
- **Compression**: Use Hive's built-in compression for large data

### **ML Model Optimization**
- **Model Quantization**: Use quantized TFLite models
- **Caching**: Cache ML predictions for repeated inputs
- **Background Processing**: Run ML tasks in isolates

## 🌐 **Deployment**

### **Web Deployment**
```bash
flutter build web --release
# Deploy build/web/ to your web server
```

### **Mobile Deployment**
- **Google Play Store**: Upload AAB file
- **Apple App Store**: Upload IPA file via Xcode
- **Enterprise Distribution**: Use MDM solutions

## 🤝 **Contributing**

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### **Code Style**
- Follow Flutter best practices
- Use `flutter_lints` for code analysis
- Document public APIs
- Write unit tests for business logic

## 📞 **Support & Issues**

### **Getting Help**
- **Documentation**: Check the `/docs` folder
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Use GitHub Discussions for questions

### **Known Issues**
- **ML Models**: Ensure proper model files are in `assets/ml_models/`
- **Permissions**: Grant camera/storage permissions on mobile devices
- **Offline Sync**: Check network connectivity for sync issues

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **WHO**: For child growth standards and guidelines
- **Flutter Community**: For excellent packages and tools
- **TensorFlow Lite**: For mobile ML capabilities
- **Hive Team**: For fast local database solution

## 📊 **Project Statistics**

- **Flutter Version**: 3.35.3
- **Dart Version**: 3.9.2
- **Supported Platforms**: Android, iOS, Web, macOS
- **Minimum Android**: API 21 (Android 5.0)
- **Minimum iOS**: iOS 11.0
- **Languages**: English, French (expandable)

---

**Built with ❤️ for healthcare workers worldwide**

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
```

## 📱 **Android & Samsung Device Testing Guide**

### **Prerequisites for Android Testing**

#### **Development Environment Setup**
1. **Android Studio Installation**
   - Install Android Studio (latest stable version)
   - Install Android SDK Platform-Tools
   - Configure SDK Manager with API levels 21-34

2. **Device Setup**
   ```bash
   # Enable Developer Options on Samsung/Android device
   Settings > About Phone > Software Information > Tap "Build Number" 7 times
   Settings > Developer Options > Enable "USB Debugging"
   Settings > Developer Options > Enable "Install via USB"
   ```

3. **Driver Installation**
   - **Samsung**: Install Samsung Smart Switch or Samsung USB drivers
   - **Generic Android**: Install Google USB drivers via SDK Manager
   - **OnePlus**: Install OnePlus USB drivers
   - **Xiaomi**: Install Mi PC Suite

### **Device-Specific Testing Matrix**

#### **Samsung Device Testing Priority**
| Device Model | Android Version | Priority | Special Considerations |
|--------------|-----------------|----------|------------------------|
| Galaxy S24/S23 | Android 14 | High | Latest Samsung One UI |
| Galaxy A54/A34 | Android 14 | High | Mid-range performance |
| Galaxy Tab S9 | Android 14 | Medium | Tablet optimization |
| Galaxy S21 | Android 13 | Medium | Legacy support |
| Galaxy A14 | Android 13 | Low | Budget device testing |

#### **Generic Android Testing**
| Device Category | Android Version | Test Focus |
|-----------------|-----------------|------------|
| Google Pixel 7/8 | Android 14 | Stock Android behavior |
| OnePlus 11/12 | Android 14 | OxygenOS compatibility |
| Xiaomi 13/14 | Android 14 | MIUI optimization |
| Budget devices (Android 11-12) | API 30-31 | Performance testing |

### **Testing Procedures**

#### **1. Initial Device Connection**
```bash
# Check device recognition
adb devices
# Should show: "device_id	device"

# If unauthorized, accept RSA key prompt on device
adb kill-server
adb start-server
adb devices
```

#### **2. Development Testing**
```bash
# Install debug APK
flutter install

# Run with hot reload
flutter run --debug

# Run with specific device
flutter run -d device_id

# Check device logs in real-time
flutter logs
```

#### **3. Performance Testing**
```bash
# Profile mode testing
flutter run --profile

# Performance overlay
flutter run --profile --trace-systrace

# Memory profiling
flutter run --profile --observatory-port=8888
```

#### **4. Release Testing**
```bash
# Build release APK
flutter build apk --release

# Install release APK
flutter install --use-application-binary=build/app/outputs/flutter-apk/app-release.apk

# Test release functionality
adb shell am start -n com.example.cgm_app/.MainActivity
```

### **Samsung-Specific Testing Scenarios**

#### **Camera & ML Testing**
```bash
# Test camera permissions
adb shell pm grant com.example.cgm_app android.permission.CAMERA
adb shell pm grant com.example.cgm_app android.permission.WRITE_EXTERNAL_STORAGE

# Test ML model loading
adb logcat | grep "tflite"
adb logcat | grep "MLService"
```

#### **Storage & Permissions**
```bash
# Check storage permissions on Samsung
adb shell dumpsys package com.example.cgm_app | grep permission

# Test file picker on Samsung
adb shell am start -a android.intent.action.GET_CONTENT -t "*/*"
```

#### **Samsung DeX Testing**
```bash
# Enable Samsung DeX mode
Settings > Advanced Features > Samsung DeX > Enable

# Test app behavior in DeX mode
# Verify: UI scaling, mouse support, window resizing
```

### **Network & Sync Testing**

#### **Offline Functionality**
```bash
# Test offline storage
adb shell settings put global airplane_mode_on 1
adb shell am broadcast -a android.intent.action.AIRPLANE_MODE

# Verify local data persistence
adb shell run-as com.example.cgm_app ls databases/
```

#### **Sync Testing**
```bash
# Test sync with network changes
adb shell svc wifi enable
adb shell svc wifi disable

# Monitor sync logs
adb logcat | grep "SyncService"
```

### **Device-Specific Issues & Solutions**

#### **Samsung Issues**
| Issue | Solution | Command |
|-------|----------|---------|
| Camera not opening | Check Samsung camera permissions | `adb shell pm grant com.example.cgm_app android.permission.CAMERA` |
| Storage access denied | Enable Samsung My Files access | Settings > Apps > Special Access > All Files Access |
| Background sync killed | Disable Samsung battery optimization | Settings > Battery > Background Limits |
| ML models not loading | Check Samsung Knox restrictions | Settings > Biometrics & Security > Knox |

#### **Generic Android Issues**
| Issue | Solution | Command |
|-------|----------|---------|
| USB debugging not working | Revoke USB debugging authorizations | `adb devices` then re-authorize |
| App not installing | Check unknown sources setting | Settings > Security > Unknown Sources |
| Performance issues | Check device storage | `adb shell df -h` |

### **Testing Checklist**

#### **Pre-Testing Setup**
- [ ] Device developer options enabled
- [ ] USB debugging authorized
- [ ] Samsung Smart Switch installed (for Samsung devices)
- [ ] ADB drivers installed
- [ ] Flutter doctor shows no issues

#### **Functional Testing**
- [ ] App installs successfully
- [ ] Camera permission granted
- [ ] Storage permission granted
- [ ] Location permission granted
- [ ] Child registration works
- [ ] Photo capture works
- [ ] ML measurements work
- [ ] Offline storage works
- [ ] Excel export works
- [ ] Sync functionality works

#### **Performance Testing**
- [ ] App launches within 3 seconds
- [ ] Camera opens within 2 seconds
- [ ] ML processing completes within 5 seconds
- [ ] No memory leaks during 30-minute usage
- [ ] Battery usage < 5% per hour

#### **Samsung-Specific Testing**
- [ ] Samsung DeX compatibility
- [ ] Samsung Knox compliance
- [ ] Samsung camera integration
- [ ] Samsung file picker integration
- [ ] Samsung battery optimization handling

### **Automated Testing**

#### **Integration Tests**
```bash
# Run integration tests on connected device
flutter test integration_test/ --device-id=device_id

# Run specific test scenarios
flutter test integration_test/app_test.dart --device-id=device_id
```

#### **Device Farm Testing**
```bash
# Firebase Test Lab (recommended for Samsung devices)
gcloud firebase test android run \
  --type instrumentation \
  --app build/app/outputs/apk/debug/app-debug.apk \
  --device model=starqlteue,version=29,locale=en,orientation=portrait \
  --timeout 30m

# AWS Device Farm
aws devicefarm create-upload --project-arn project_arn --name app-debug.apk --type ANDROID_APP
```

### **Troubleshooting Quick Reference**

#### **Common ADB Commands**
```bash
# Check connected devices
adb devices

# Install APK
adb install -r build/app/outputs/apk/debug/app-debug.apk

# Uninstall app
adb uninstall com.example.cgm_app

# Clear app data
adb shell pm clear com.example.cgm_app

# View logs
adb logcat -v time | grep flutter
```

#### **Samsung-Specific Commands**
```bash
# Check Samsung Knox status
adb shell getprop ro.boot.knox

# Check Samsung camera features
adb shell dumpsys media.camera | grep -i samsung

# Check Samsung storage permissions
adb shell dumpsys package com.example.cgm_app | grep -i storage
```

### **Testing Environment Variables**
```bash
# Set testing environment
export FLUTTER_TEST_DEVICE="SM-G991B"  # Samsung Galaxy S21
export ANDROID_HOME="/Users/[user]/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
```flutter build appbundle --release

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

# 🎯 CGM QMax - Child Growth Monitoring Application

A comprehensive Flutter application designed for healthcare professionals and field workers to monitor child growth and nutrition in resource-constrained environments. Built with offline-first architecture and ML-powered analysis capabilities.

## 📋 Project Overview

CGM QMax is a production-ready mobile application that empowers healthcare workers to efficiently track child growth metrics, assess nutritional status, and provide data-driven interventions. The app is specifically optimized for Samsung Galaxy devices and designed to work seamlessly in offline environments.

## 🚀 Key Features

### Core Functionality
- **Child Registration & Management**: Complete biometric data capture with photo documentation
- **ML-Powered Measurements**: AI-driven height/weight estimation using TensorFlow Lite
- **MUAC Analysis**: Automated Mid-Upper Arm Circumference measurement via photo analysis
- **Nutrition Tracking**: Comprehensive diet assessment with automated nutritional calculations
- **Growth Analytics**: Real-time growth charts and percentile calculations

### Data Management
- **Offline-First Architecture**: Full functionality without internet connectivity
- **Excel Integration**: Import/export zone and worker data via Excel files
- **Smart Sync**: Intelligent synchronization when network is available
- **Data Encryption**: Secure storage with Hive encrypted database
- **Multi-User Support**: Worker management with role-based access

### Technical Features
- **Multi-Language Support**: Internationalization ready (English/French)
- **Samsung Optimization**: Tested on Galaxy S24/S23, A54/A34, Tab S9
- **Performance Analytics**: Built-in usage tracking and reporting
- **Backup & Recovery**: Automated data backup with recovery options

## 🛠️ Technical Architecture

### Frontend
- **Framework**: Flutter 3.19+ for cross-platform compatibility
- **State Management**: Riverpod for reactive state management
- **UI Framework**: Material Design 3 with responsive layouts
- **Navigation**: GoRouter for declarative routing

### Storage & Sync
- **Local Storage**: Hive for offline-first data persistence
- **Encryption**: AES-256 encryption for sensitive data
- **Sync Engine**: Custom offline-to-online synchronization
- **Conflict Resolution**: Intelligent merge strategies

### Machine Learning
- **Framework**: TensorFlow Lite for on-device inference
- **Models**: 
  - Height/Weight estimation from photos
  - MUAC detection and measurement
  - Nutrition analysis algorithms
- **Performance**: Optimized for mobile devices

## 📱 Device Compatibility

### Primary Targets
- **Samsung Galaxy S24/S23**: Flagship devices with advanced cameras
- **Samsung Galaxy A54/A34**: Mid-range devices for field deployment
- **Samsung Galaxy Tab S9**: Tablets for enhanced data entry

### Android Requirements
- **Minimum SDK**: Android 8.0 (API level 26)
- **Target SDK**: Android 14 (API level 34)
- **Architecture**: ARM64 and x86_64 support

## 🏗️ Development Setup

### Prerequisites
```bash
# Flutter SDK
flutter --version  # Requires 3.19.0+
dart --version     # Requires 3.3.0+

# Development Tools
Android Studio / VS Code
Android SDK (API 34)
Git for version control
```

### Installation
```bash
# Clone the repository
git clone https://github.com/satishskid/cgmflutter.git
cd cgmflutter

# Install dependencies
flutter pub get

# Generate localization files
flutter gen-l10n

# Run development server
flutter run --debug
```

### Build Commands
```bash
# Development build
flutter run --debug

# Production build
flutter build appbundle --release
flutter build apk --release

# Web build
flutter build web --release
```

## 📦 Dependencies

### Core Dependencies
```yaml
# State Management
flutter_riverpod: ^2.4.9
riverpod_annotation: ^2.3.3

# Storage
hive: ^2.2.3
hive_flutter: ^1.1.0
path_provider: ^2.1.1

# ML & Camera
tflite_flutter: ^0.10.4
camera: ^0.10.5+5
image_picker: ^1.0.4

# UI & Localization
flutter_localizations:
  sdk: flutter
intl: any
cupertino_icons: ^1.0.6

# Utilities
shared_preferences: ^2.2.2
connectivity_plus: ^5.0.1
excel: ^2.1.0
file_picker: ^6.1.1
```

## 🧪 Testing

### Test Structure
```bash
# Unit tests
flutter test test/unit/

# Widget tests
flutter test test/widget/

# Integration tests
flutter test integration_test/

# All tests
flutter test
```

### Test Coverage
- **Unit Tests**: Core business logic, data models, services
- **Widget Tests**: UI components, user interactions
- **Integration Tests**: End-to-end workflows, device compatibility
- **Device Testing**: Samsung-specific testing matrix

## 🚀 Deployment

### Distribution Channels
1. **Google Play Store**: Production and enterprise tracks
2. **Enterprise MDM**: Samsung Knox and Microsoft Intune
3. **Direct APK**: Sideloading for controlled environments
4. **Web Deployment**: Progressive Web App (PWA)

### Release Process
1. **Version Management**: Semantic versioning (MAJOR.MINOR.PATCH)
2. **Build Signing**: Keystore management for Android
3. **Testing**: Samsung device testing matrix
4. **Rollout**: Staged rollout with monitoring

## 📊 Project Structure

```
lib/
├── main.dart                 # Application entry point
├── models/                   # Data models
│   ├── child.dart           # Child entity
│   ├── screening.dart       # Screening records
│   └── nutrition.dart       # Nutrition data
├── screens/                  # UI screens
│   ├── login/               # Authentication
│   ├── children/            # Child management
│   ├── screening/           # Screening flow
│   └── analytics/           # Reports and charts
├── services/                 # Business logic
│   ├── ml_service.dart      # ML model management
│   ├── sync_service.dart    # Data synchronization
│   └── storage_service.dart # Local storage
├── widgets/                  # Reusable components
├── generated/                # Localization files
└── utils/                    # Utilities and helpers
```

## 🔧 Configuration

### Environment Variables
```bash
# Development
flutter run --dart-define=ENV=development

# Staging
flutter run --dart-define=ENV=staging

# Production
flutter run --dart-define=ENV=production
```

### Build Flavors
- **Development**: Debug mode with hot reload
- **Staging**: Release mode with staging backend
- **Production**: Release mode with production backend

## 📈 Analytics & Monitoring

### Built-in Analytics
- **Usage Tracking**: Screen views, feature usage
- **Performance**: Load times, memory usage
- **Error Tracking**: Crash reports, exception handling
- **Sync Metrics**: Data sync success rates

### External Integration
- **Firebase Analytics**: User behavior tracking
- **Crashlytics**: Crash reporting and analysis
- **Performance Monitoring**: App performance metrics

## 🔐 Security

### Data Protection
- **Encryption**: AES-256 for sensitive data
- **Secure Storage**: Android Keystore integration
- **Network Security**: HTTPS/TLS for all communications
- **Input Validation**: Sanitization of all user inputs

### Privacy Compliance
- **GDPR**: General Data Protection Regulation compliance
- **COPPA**: Children's Online Privacy Protection Act
- **HIPAA**: Healthcare data protection standards

## 🆘 Troubleshooting

### Common Issues
```bash
# Flutter doctor
flutter doctor -v

# Clean build
flutter clean
flutter pub get

# Reset pods (iOS)
cd ios && pod deintegrate && pod install

# Clear Hive cache
flutter clean && flutter pub get
```

### Device-Specific Issues
- **Samsung Camera**: Check camera permissions
- **Storage**: Ensure sufficient storage space
- **Network**: Verify connectivity for sync

## 📚 Documentation

### API Documentation
- **Dart Doc**: Generated documentation
- **Code Comments**: Comprehensive inline documentation
- **Architecture**: Detailed technical specifications

### User Guides
- **Field Worker Guide**: Step-by-step usage instructions
- **Admin Guide**: Setup and configuration
- **Troubleshooting**: Common issues and solutions

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

### Code Standards
- **Dart Style Guide**: Follow official Dart conventions
- **Linting**: Enforced via `analysis_options.yaml`
- **Testing**: Required for all new features
- **Documentation**: Required for public APIs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/satishskid/cgmflutter/issues)
- **Discussions**: [GitHub Discussions](https://github.com/satishskid/cgmflutter/discussions)
- **Documentation**: [Wiki](https://github.com/satishskid/cgmflutter/wiki)

### Contact
- **Project Maintainer**: [satishskid](https://github.com/satishskid)
- **Email**: Available via GitHub profile

---

**Built for healthcare professionals, by healthcare technology experts** 🏥✨

---

*Last updated: January 2025*

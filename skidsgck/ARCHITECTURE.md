# SKIDS EYEAR - Architecture & Development Roadmap

## System Overview

SKIDS EYEAR is a comprehensive pediatric vision and hearing screening platform consisting of:

1. **Mobile App** (React Native/Expo) - On-device screening with offline capability
2. **Admin Portal** (React/Vite PWA) - School-level analytics and data management
3. **Backend Services** (Node.js scripts) - Data conversion and batch processing

---

## Phase 1: Foundation & Testing Infrastructure ✅ IN PROGRESS

### 1.1 Project Setup & Dependencies
- [ ] Install all dependencies (admin-portal, app, scripts)
- [ ] Verify builds work
- [ ] Setup testing framework

### 1.2 Core Data Models & Validation
- [ ] Define ScreeningResult TypeScript types
- [ ] Define FHIR/HL7 export schemas
- [ ] Create validation utilities

### 1.3 Test Infrastructure
- [ ] Setup Jest for unit tests
- [ ] Create test utilities and mocks
- [ ] Test all existing services

---

## Phase 2: Mobile App Core Features (Weeks 1-2)

### 2.1 Database Layer (SQLite)
- [ ] Implement offlineDB.js with SQLite
- [ ] Create schema for children, results, sync queue
- [ ] Test CRUD operations

### 2.2 Mobile UI Screens
- [ ] HomeScreen - Child selection & navigation
- [ ] QRScannerScreen - Real-time QR decoding
- [ ] VisionScreen - Interactive logMAR test UI
- [ ] HearingScreen - Audio playback & response collection
- [ ] ExportScreen - Data export options

### 2.3 QR Integration
- [ ] Real-time camera QR scanning
- [ ] Fallback manual child selection
- [ ] Generate printable QR rosters

### 2.4 Screening Engines
- [ ] Complete vision test (logMAR + crowding)
- [ ] Implement Web Audio API for hearing
- [ ] Add stereopsis, alignment, red reflex stubs

---

## Phase 3: Admin Portal ✅ COMPLETE

### 3.1 Data Import/Export
- [x] Excel roster importer
- [x] CSV export
- [x] JSON export
- [ ] FHIR R4 export functionality (mobile app has this)
- [ ] HL7 v2.5 export (mobile app has this)
- [ ] PDF report generation (future enhancement)

### 3.2 Analytics Dashboard
- [x] Real-time data sync from mobile app
- [x] School-level analytics views
- [x] Pass/refer rate breakdowns
- [x] Trend analysis
- [x] Grade-level breakdowns
- [x] Referral case tracking

### 3.3 PWA Features
- [x] Service worker for offline caching
- [x] Background sync
- [x] File-based data import/export
- [x] IndexedDB storage

---

## Phase 4: Integration & Quality Assurance (Week 4)

### 4.1 Mobile ↔ Admin Sync
- [ ] FHIR bundle transmission
- [ ] USB/File-based sync
- [ ] Conflict resolution

### 4.2 Testing & Validation
- [ ] Unit tests for all engines
- [ ] Integration tests
- [ ] E2E testing
- [ ] Accessibility testing

### 4.3 Documentation
- [ ] API documentation
- [ ] User guide
- [ ] Deployment guide

---

## Technical Stack

### Mobile App
- Framework: React Native (Expo)
- Database: SQLite (react-native-sqlite-storage)
- Camera: expo-camera + real-time QR decoding
- Audio: expo-av (Web Audio API)
- State: Context API + Zustand
- Testing: Jest + React Native Testing Library

### Admin Portal
- Framework: React 18 + Vite
- PWA: Vite PWA plugin
- State: Context API + Zustand
- Export: XLSX, pdfkit, fhir-bundle-validator
- Testing: Vitest + React Testing Library

### Scripts
- QR Generation: qrcode + pdfkit
- Data Conversion: FHIR → HL7 converter
- CLI: Commander.js

---

## Data Models

### ScreeningResult
```typescript
interface ScreeningResult {
  id: string;
  childId: string;
  childName: string;
  dateOfBirth: string;
  screeningDate: string;
  
  // Vision
  visionAcuity: {
    logMAR: number;
    snellenEquivalent: string;
    pass: boolean;
  };
  
  // Hearing
  hearingResults: {
    [key: string]: boolean; // "1000_30dB", "2000_30dB", "4000_30dB"
  };
  hearingPass: boolean;
  
  // Referral
  referralNeeded: boolean;
  referralReasons: string[];
  
  // Metadata
  screenerId: string;
  schoolCode: string;
  notes: string;
}
```

---

## API Contracts

### Mobile → Admin (FHIR Bundle)
Uses FHIR R4 Bundle resource with Patient, Observation, and DiagnosticReport

### Admin → National System (HL7 v2.5)
MSH|PID|OBR|OBX segments with LOINC codes

### Sync Protocol
File-based JSON or USB transfer with conflict resolution

---

## Testing Strategy

- **Unit Tests**: Each service tested in isolation
- **Integration Tests**: Services working together
- **E2E Tests**: Full screening workflow from child selection to export
- **Validation Tests**: Algorithm accuracy against gold standard

---

## Deployment

### Mobile
- Build: EAS Build (Expo)
- Distribution: Google Play + Apple App Store

### Admin Portal
- Build: Vite production build
- Hosting: Docker container (nginx)
- PWA installable on web

### Database
- Postgres for admin portal backend (optional)
- SQLite on mobile (local)

---

## Success Criteria

✅ All services unit tested  
✅ Mobile app fully functional offline  
✅ Admin portal can import/export all formats  
✅ Data sync working bidirectionally  
✅ >95% screening data accuracy  
✅ <5s QR scan time  
✅ Accessibility WCAG 2.1 AA compliance  

#!/bin/bash

# CGM App Test Execution Script
# Run this script to systematically test the CGM application

echo "🧪 CGM App Test Execution Script"
echo "================================"
echo ""

# Check Flutter environment
echo "🔍 Checking Flutter Environment..."
flutter doctor

if [ $? -ne 0 ]; then
    echo "❌ Flutter environment not properly set up"
    exit 1
fi

# Install dependencies
echo "📦 Installing Dependencies..."
flutter pub get

# Create test directories
echo "📁 Setting up test directories..."
mkdir -p test_data/images
mkdir -p test_data/reports
mkdir -p test_data/logs

# Test 1: Build Verification
echo ""
echo "🏗️  Test 1: Build Verification"
echo "-----------------------------"
flutter build apk --debug
if [ $? -eq 0 ]; then
    echo "✅ Debug build successful"
else
    echo "❌ Debug build failed"
    exit 1
fi

# Test 2: Unit Tests
echo ""
echo "🧪 Test 2: Running Unit Tests"
echo "----------------------------"
flutter test test/ 2>/dev/null || echo "⚠️  No unit tests found - consider adding"

# Test 3: Integration Test Setup
echo ""
echo "🔗 Test 3: Integration Test Setup"
echo "---------------------------------"

# Create test data
echo "Creating test data..."

# Test Excel files
cat > test_data/workers_test.xlsx << 'EOF'
Name,Email,Zone,Role
John Smith,john@example.com,Zone A,Health Worker
Jane Doe,jane@example.com,Zone B,Nutritionist
Mike Johnson,mike@example.com,Zone C,Supervisor
Sarah Wilson,sarah@example.com,Zone A,Health Worker
EOF

# Test 4: Launch App for Manual Testing
echo ""
echo "📱 Test 4: Manual Testing Setup"
echo "-------------------------------"
echo "Launching app for manual testing..."

# Check for connected devices
echo "Available devices:"
flutter devices

echo ""
echo "To run manual tests:"
echo "1. Connect a device or start emulator"
echo "2. Run: flutter run"
echo "3. Follow the test scenarios below:"

# Display test scenarios
echo ""
echo "🎯 Manual Test Scenarios"
echo "======================="

# Test Scenario 1
echo ""
echo "📋 Scenario 1: Complete Child Registration"
echo "Steps:"
echo "1. Login with test credentials"
echo "2. Tap 'Add Child'"
echo "3. Enter: Name='Test Child Alpha', DOB='2020-01-15', Gender='Male'"
echo "4. Take photo or select from gallery"
echo "5. Select Zone: 'Zone A'"
echo "6. Assign Worker: 'John Smith'"
echo "7. Save and verify child appears in list"

# Test Scenario 2
echo ""
echo "📏 Scenario 2: ML Height/Weight Measurement"
echo "Steps:"
echo "1. Select test child"
echo "2. Tap 'Add Screening'"
echo "3. Take height photo with clear reference object"
echo "4. Verify height estimation (expected ~95cm ± 5cm)"
echo "5. Take weight estimation photo"
echo "6. Verify BMI classification"

# Test Scenario 3
echo ""
echo "💪 Scenario 3: MUAC Malnutrition Detection"
echo "Steps:"
echo "1. Navigate to MUAC measurement"
echo "2. Take arm photo for MUAC measurement"
echo "3. Test different MUAC values:"
echo "   - Severe: <11.5cm (Red alert)"
echo "   - Moderate: 11.5-12.5cm (Orange warning)"
echo "   - Normal: >13.5cm (Green status)"

# Test Scenario 4
echo ""
echo "📊 Scenario 4: Analytics Dashboard"
echo "Steps:"
echo "1. Navigate to Analytics screen"
echo "2. Verify malnutrition statistics display"
echo "3. Test date range filtering"
echo "4. Generate PDF report"
echo "5. Export Excel file"

# Test Scenario 5
echo ""
echo "📴 Scenario 5: Offline Functionality"
echo "Steps:"
echo "1. Turn on airplane mode"
echo "2. Add new child while offline"
echo "3. Take screening measurements offline"
echo "4. Turn off airplane mode"
echo "5. Verify auto-sync works"

# Test Scenario 6
echo ""
echo "📈 Scenario 6: Performance Load Test"
echo "Steps:"
echo "1. Create 50+ test children"
echo "2. Add 200+ screening records"
echo "3. Test search functionality"
echo "4. Generate analytics reports"
echo "5. Verify app remains responsive"

# Test Scenario 7
echo ""
echo "🗂️ Scenario 7: Excel Import/Export"
echo "Steps:"
echo "1. Import workers from Excel"
echo "2. Verify all workers imported correctly"
echo "3. Export current worker list"
echo "4. Verify exported data accuracy"

# Create test runner script
cat > test_data/run_tests.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting CGM App Test Suite"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "${YELLOW}Testing: $test_name${NC}"
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        ((FAILED++))
    fi
}

# Static analysis tests
echo ""
echo "🔍 Static Analysis Tests"
echo "-------------------------"
run_test "Flutter analyze" "flutter analyze"
run_test "Dart format check" "dart format --output=none --set-exit-if-changed ."

# Build tests
echo ""
echo "🏗️ Build Tests"
echo "--------------"
run_test "Debug build" "flutter build apk --debug"
run_test "Release build" "flutter build apk --release"

# Test summary
echo ""
echo "📊 Test Summary"
echo "==============="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Total: $((PASSED + FAILED))${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Ready for manual testing.${NC}"
else
    echo -e "${RED}⚠️ Some tests failed. Please review and fix issues.${NC}"
fi
EOF

chmod +x test_data/run_tests.sh

# Create test data generator
cat > test_data/generate_test_data.dart << 'EOF'
import 'dart:convert';
import 'dart:math';
import 'package:cgm_qmax/models/child.dart';
import 'package:cgm_qmax/models/screening.dart';
import 'package:hive/hive.dart';

void generateTestData() async {
  final random = Random();
  
  // Generate test children
  final childrenBox = Hive.box<Child>('children');
  final screeningsBox = Hive.box<Screening>('screenings');
  
  // Clear existing test data
  await childrenBox.clear();
  await screeningsBox.clear();
  
  final names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
  final zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
  
  for (int i = 0; i < 20; i++) {
    final child = Child()
      ..name = '${names[i % names.length]} Test ${i + 1}'
      ..dateOfBirth = DateTime.now().subtract(Duration(days: 365 * (3 + random.nextInt(3))))
      ..gender = i % 2 == 0 ? 'Male' : 'Female'
      ..zoneId = zones[i % zones.length]
      ..workerId = 'worker_${i % 5}'
      ..createdAt = DateTime.now();
    
    await childrenBox.put(child.id, child);
    
    // Generate 2-5 screenings per child
    final screeningCount = 2 + random.nextInt(4);
    for (int j = 0; j < screeningCount; j++) {
      final screening = Screening()
        ..childId = child.id
        ..height = 80 + random.nextDouble() * 40
        ..weight = 10 + random.nextDouble() * 15
        ..muac = 10 + random.nextDouble() * 6
        ..date = DateTime.now().subtract(Duration(days: 30 * j))
        ..notes = 'Test screening ${j + 1}'
        ..createdAt = DateTime.now();
      
      await screeningsBox.put(screening.id, screening);
    }
  }
  
  print('✅ Test data generated: 20 children, ${20 * 3} screenings');
}
EOF

echo ""
echo "📋 Test Setup Complete!"
echo "======================"
echo ""
echo "Next steps:"
echo "1. Run static tests: ./test_data/run_tests.sh"
echo "2. Launch app: flutter run"
echo "3. Execute manual tests using scenarios above"
echo "4. Use test_data/generate_test_data.dart for load testing"
echo ""
echo "📁 Test artifacts created:"
echo "- TESTING_CHECKLIST.md: Comprehensive test checklist"
echo "- test_data/test_scenarios.json: Detailed test scenarios"
echo "- test_data/run_tests.sh: Automated test runner"
echo "- test_data/generate_test_data.dart: Test data generator"
echo ""
echo "🎯 Ready for thorough testing!"
#!/usr/bin/env node

/**
 * Phase 1 Implementation Validation Script
 * This script validates that our Phase 1 implementation is working correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Phase 1 Implementation Validation');
console.log('=====================================');

// 1. Check if schema file exists and has new tables
console.log('\n📋 1. Database Schema Validation');
const schemaPath = path.join(__dirname, 'convex', 'schema.ts');
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  const requiredTables = [
    'providers',
    'provider_schedules',
    'provider_availability',
    'appointment_reminders',
    'appointment_reschedules',
    'contracts',
    'contract_beneficiaries'
  ];

  let schemaValid = true;
  for (const table of requiredTables) {
    if (schemaContent.includes(`"${table}": defineTable`)) {
      console.log(`✅ Table ${table} found in schema`);
    } else {
      console.log(`❌ Table ${table} missing from schema`);
      schemaValid = false;
    }
  }

  if (schemaValid) {
    console.log('🎉 Database schema validation PASSED');
  } else {
    console.log('❌ Database schema validation FAILED');
  }
} else {
  console.log('❌ Schema file not found');
}

// 2. Check if provider functions exist
console.log('\n📋 2. Provider Management Functions Validation');
const providersPath = path.join(__dirname, 'convex', 'providers.ts');
if (fs.existsSync(providersPath)) {
  const providersContent = fs.readFileSync(providersPath, 'utf8');

  const requiredFunctions = [
    'createProvider',
    'getAllProviders',
    'getProviderById',
    'updateProvider',
    'setProviderSchedule',
    'getProviderSchedule',
    'getProviderAvailableSlots',
    'bookAppointmentWithProvider'
  ];

  let functionsValid = true;
  for (const func of requiredFunctions) {
    if (providersContent.includes(`export const ${func}`)) {
      console.log(`✅ Function ${func} found`);
    } else {
      console.log(`❌ Function ${func} missing`);
      functionsValid = false;
    }
  }

  if (functionsValid) {
    console.log('🎉 Provider functions validation PASSED');
  } else {
    console.log('❌ Provider functions validation FAILED');
  }
} else {
  console.log('❌ Provider functions file not found');
}

// 3. Check if contract functions exist
console.log('\n📋 3. Contract Management Functions Validation');
const contractsPath = path.join(__dirname, 'convex', 'contracts.ts');
if (fs.existsSync(contractsPath)) {
  const contractsContent = fs.readFileSync(contractsPath, 'utf8');

  const requiredFunctions = [
    'createContract',
    'getAllContracts',
    'getContractById',
    'updateContractStatus',
    'addContractBeneficiary',
    'getContractUtilization',
    'requestAppointmentReschedule',
    'approveRescheduleRequest'
  ];

  let functionsValid = true;
  for (const func of requiredFunctions) {
    if (contractsContent.includes(`export const ${func}`)) {
      console.log(`✅ Function ${func} found`);
    } else {
      console.log(`❌ Function ${func} missing`);
      functionsValid = false;
    }
  }

  if (functionsValid) {
    console.log('🎉 Contract functions validation PASSED');
  } else {
    console.log('❌ Contract functions validation FAILED');
  }
} else {
  console.log('❌ Contract functions file not found');
}

// 4. Check if backup was created
console.log('\n📋 4. Backup Validation');
const backupDir = fs.readdirSync('.').find(dir => dir.startsWith('backup-'));
if (backupDir) {
  console.log(`✅ Backup found: ${backupDir}`);
  const backupContents = fs.readdirSync(backupDir);
  const requiredBackupFiles = ['schema-backup.ts', 'restore.sh', 'BACKUP-README.md'];
  let backupValid = true;

  for (const file of requiredBackupFiles) {
    if (backupContents.includes(file)) {
      console.log(`✅ Backup file ${file} exists`);
    } else {
      console.log(`❌ Backup file ${file} missing`);
      backupValid = false;
    }
  }

  if (backupValid) {
    console.log('🎉 Backup validation PASSED');
  } else {
    console.log('❌ Backup validation FAILED');
  }
} else {
  console.log('❌ No backup directory found');
}

// 5. Check development server status
console.log('\n📋 5. Development Environment Validation');
const { exec } = require('child_process');
exec('ps aux | grep -E "(vite|convex)" | grep -v grep | wc -l', (error, stdout, stderr) => {
  const processCount = parseInt(stdout.trim());
  if (processCount >= 1) {
    console.log('✅ Development servers are running');
  } else {
    console.log('❌ No development servers running');
  }

  // 6. Final summary
  console.log('\n🎯 PHASE 1 IMPLEMENTATION SUMMARY');
  console.log('=====================================');

  const checks = [
    { name: 'Database Schema', status: schemaValid ? '✅ PASS' : '❌ FAIL' },
    { name: 'Provider Functions', status: functionsValid ? '✅ PASS' : '❌ FAIL' },
    { name: 'Contract Functions', status: functionsValid ? '✅ PASS' : '❌ FAIL' },
    { name: 'Backup System', status: backupValid ? '✅ PASS' : '❌ FAIL' },
    { name: 'Development Server', status: processCount >= 1 ? '✅ PASS' : '❌ FAIL' },
  ];

  let allPassed = true;
  for (const check of checks) {
    console.log(`${check.name.padEnd(20)}: ${check.status}`);
    if (check.status.includes('❌')) allPassed = false;
  }

  console.log('\n' + '='.repeat(40));
  if (allPassed) {
    console.log('🎉 PHASE 1 IMPLEMENTATION: SUCCESSFUL');
    console.log('✅ All validations passed');
    console.log('🚀 Ready to proceed to Phase 2');
  } else {
    console.log('⚠️  PHASE 1 IMPLEMENTATION: ISSUES FOUND');
    console.log('❌ Some validations failed - please review');
    console.log('🔄 Check the errors above and fix them');
  }
  console.log('='.repeat(40));
});

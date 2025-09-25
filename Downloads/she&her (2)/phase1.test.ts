/**
 * Phase 1 Implementation Test Suite
 * Tests Provider Management, Enhanced Appointments, and Contract Management
 */

import { test } from 'vitest';
import { expect } from 'vitest';

// Mock Convex functions for testing
const mockCtx = {
  auth: {
    getUserIdentity: async () => ({
      subject: 'test-user-123',
      name: 'Test Manager',
      email: 'test@example.com',
    }),
  },
  db: {
    insert: async (table: string, data: any) => `mock-${table}-id-${Date.now()}`,
    get: async (id: string) => ({ _id: id, ...data }),
    query: (table: string) => ({
      filter: (predicate: any) => ({
        collect: async () => [],
        first: async () => null,
        unique: async () => null,
      }),
      withIndex: (index: string, query: any) => ({
        collect: async () => [],
        first: async () => null,
        unique: async () => null,
        eq: (field: string, value: any) => ({
          collect: async () => [],
          first: async () => null,
          unique: async () => null,
        }),
      }),
      collect: async () => [],
      order: (direction: string) => ({
        collect: async () => [],
        desc: () => ({ collect: async () => [] }),
      }),
    }),
    patch: async (id: string, updates: any) => id,
    delete: async (id: string) => true,
  },
};

// Test data
const mockProviderData = {
  name: "Dr. Sarah Johnson",
  specialization: ["Gynecology", "Obstetrics"],
  license_number: "LIC123456",
  contact_info: {
    email: "sarah.johnson@santaan.in",
    phone: "+91-9876543210",
    address: "123 Medical Center, Mumbai",
  },
  availability_schedule: {
    monday: { start: "09:00", end: "17:00", slots: 30 },
    tuesday: { start: "09:00", end: "17:00", slots: 30 },
  },
  service_rates: {
    consultation_fee: 2000,
    follow_up_fee: 1500,
    emergency_fee: 5000,
  },
};

const mockContractData = {
  company_name: "Innovate Inc.",
  company_size: 250,
  contract_type: "annual",
  start_date: Date.now(),
  end_date: Date.now() + (365 * 24 * 60 * 60 * 1000),
  total_contract_value: 1500000,
  pricing_model: "per_employee",
  covered_services: ["serv4", "serv9"],
  service_limits: {
    telemedicine_per_month: 5,
    in_clinic_per_year: 2,
  },
  negotiated_discounts: {
    in_clinic: 0.15,
    telemedicine: 0.10,
  },
  sla_terms: {
    response_time: "24 hours",
    resolution_time: "48 hours",
  },
};

// Test Phase 1 Implementation
test('Phase 1: Provider Management System', async () => {
  console.log('🧪 Testing Provider Management System...');

  // Test provider creation
  const { createProvider } = await import('./convex/providers');
  const providerId = await createProvider(mockCtx, mockProviderData);

  expect(providerId).toBeDefined();
  expect(providerId).toMatch(/^mock-providers-id-/);
  console.log('✅ Provider creation test passed');

  // Test provider retrieval
  const { getAllProviders } = await import('./convex/providers');
  const providers = await getAllProviders(mockCtx);

  expect(Array.isArray(providers)).toBe(true);
  console.log('✅ Provider retrieval test passed');

  // Test provider schedule management
  const { setProviderSchedule } = await import('./convex/providers');
  const scheduleData = [{
    day_of_week: 1, // Monday
    start_time: "09:00",
    end_time: "17:00",
    slot_duration: 30,
    is_available: true,
  }];

  const scheduleIds = await setProviderSchedule(mockCtx, {
    providerId,
    schedules: scheduleData,
  });

  expect(Array.isArray(scheduleIds)).toBe(true);
  expect(scheduleIds.length).toBe(1);
  console.log('✅ Provider schedule management test passed');

  console.log('🎉 Provider Management System tests completed successfully!');
});

test('Phase 1: Enhanced Appointment System', async () => {
  console.log('🧪 Testing Enhanced Appointment System...');

  // Test appointment booking with provider
  const { bookAppointmentWithProvider } = await import('./convex/providers');
  const appointmentData = {
    serviceId: "serv4", // Expert Nutritionist
    slotStartTime: Date.now() + (24 * 60 * 60 * 1000), // Tomorrow
    patientContext: "SELF",
    pricePaid: 1500,
    providerId: "mock-provider-id",
  };

  const appointmentId = await bookAppointmentWithProvider(mockCtx, appointmentData);

  expect(appointmentId).toBeDefined();
  expect(appointmentId).toMatch(/^mock-appointments-id-/);
  console.log('✅ Enhanced appointment booking test passed');

  // Test appointment reschedule request
  const { requestAppointmentReschedule } = await import('./convex/contracts');
  const newSlotTime = Date.now() + (2 * 24 * 60 * 60 * 1000); // Day after tomorrow

  const rescheduleId = await requestAppointmentReschedule(mockCtx, {
    appointmentId,
    newSlotStartTime: newSlotTime,
    reason: "Patient requested different time",
  });

  expect(rescheduleId).toBeDefined();
  expect(rescheduleId).toMatch(/^mock-appointments-id-/);
  console.log('✅ Appointment reschedule request test passed');

  console.log('🎉 Enhanced Appointment System tests completed successfully!');
});

test('Phase 1: Contract Management System', async () => {
  console.log('🧪 Testing Contract Management System...');

  // Test contract creation
  const { createContract } = await import('./convex/contracts');
  const contractId = await createContract(mockCtx, mockContractData);

  expect(contractId).toBeDefined();
  expect(contractId).toMatch(/^mock-contracts-id-/);
  console.log('✅ Contract creation test passed');

  // Test contract retrieval
  const { getAllContracts } = await import('./convex/contracts');
  const contracts = await getAllContracts(mockCtx);

  expect(Array.isArray(contracts)).toBe(true);
  console.log('✅ Contract retrieval test passed');

  // Test contract status update
  const { updateContractStatus } = await import('./convex/contracts');
  const updatedContractId = await updateContractStatus(mockCtx, {
    contractId,
    status: "active",
  });

  expect(updatedContractId).toBe(contractId);
  console.log('✅ Contract status update test passed');

  // Test contract utilization
  const { getContractUtilization } = await import('./convex/contracts');
  const utilization = await getContractUtilization(mockCtx, { contractId });

  expect(utilization).toHaveProperty('total_beneficiaries');
  expect(utilization).toHaveProperty('total_appointments');
  expect(utilization).toHaveProperty('utilization_percentage');
  console.log('✅ Contract utilization test passed');

  console.log('🎉 Contract Management System tests completed successfully!');
});

test('Phase 1: Integration Test - Full Workflow', async () => {
  console.log('🧪 Testing Full Phase 1 Integration...');

  // 1. Create a provider
  const { createProvider } = await import('./convex/providers');
  const providerId = await createProvider(mockCtx, mockProviderData);

  // 2. Create a contract
  const { createContract } = await import('./convex/contracts');
  const contractId = await createContract(mockCtx, mockContractData);

  // 3. Book an appointment with the provider
  const { bookAppointmentWithProvider } = await import('./convex/providers');
  const appointmentId = await bookAppointmentWithProvider(mockCtx, {
    serviceId: "serv4",
    slotStartTime: Date.now() + (24 * 60 * 60 * 1000),
    patientContext: "SELF",
    pricePaid: 1500,
    providerId,
  });

  // 4. Verify the appointment was created
  expect(appointmentId).toBeDefined();

  // 5. Test contract utilization includes the appointment
  const { getContractUtilization } = await import('./convex/contracts');
  const utilization = await getContractUtilization(mockCtx, { contractId });

  expect(utilization.total_appointments).toBeGreaterThan(0);
  console.log('✅ Full integration test passed');

  console.log('🎉 Phase 1 Integration tests completed successfully!');
});

// Database Schema Validation Test
test('Phase 1: Database Schema Validation', async () => {
  console.log('🧪 Validating Database Schema...');

  // Test that all required tables exist in schema
  const schema = await import('./convex/schema');

  const requiredTables = [
    'providers',
    'provider_schedules',
    'provider_availability',
    'appointment_reminders',
    'appointment_reschedules',
    'contracts',
    'contract_beneficiaries',
  ];

  const schemaTables = Object.keys(schema.default._definition);

  for (const table of requiredTables) {
    expect(schemaTables).toContain(table);
    console.log(`✅ Table ${table} exists in schema`);
  }

  // Test that all required indexes exist
  const providersTable = schema.default._definition.providers;
  expect(providersTable.indexes).toContainEqual(['specialization']);

  const providerSchedulesTable = schema.default._definition.provider_schedules;
  expect(providerSchedulesTable.indexes).toContainEqual(['provider_id', 'day_of_week']);

  console.log('🎉 Database schema validation completed successfully!');
});

console.log('🚀 Phase 1 Testing Suite Ready!');
console.log('📋 Run with: npm test -- phase1.test.ts');
console.log('🔄 Next: Phase 2 - Consultation Engine Implementation');

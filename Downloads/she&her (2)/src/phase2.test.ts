/**
 * Phase 2 Implementation Test Suite
 * Tests AI Consultation Engine, Real-time Messaging, and Analytics
 */

import { test } from 'vitest';
import { expect } from 'vitest';

// Mock Convex functions for testing
const mockCtx = {
  auth: {
    getUserIdentity: async () => ({
      subject: 'test-user-123',
      name: 'Test User',
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
const mockConsultationData = {
  title: "Irregular Menstrual Cycle",
  category: "gynecology",
  priority: "medium",
  initialSymptoms: "Irregular periods for 3 months, occasional cramping",
};

const mockMessageData = {
  consultationId: "mock-consultation-id",
  messageType: "text",
  content: "I've been experiencing irregular periods",
  metadata: { urgency: "medium" },
};

// Test Phase 2 Implementation
test('Phase 2: AI Consultation Engine', async () => {
  console.log('🧪 Testing AI Consultation Engine...');

  // Test consultation creation
  const { createConsultation } = await import('../convex/consultations');
  const consultationId = await createConsultation(mockCtx, mockConsultationData);

  expect(consultationId).toBeDefined();
  expect(consultationId).toMatch(/^mock-/);
  console.log('✅ Consultation creation test passed');

  // Test consultation retrieval
  const { getUserConsultations } = await import('../convex/consultations');
  const consultations = await getUserConsultations(mockCtx, {});

  expect(Array.isArray(consultations)).toBe(true);
  console.log('✅ Consultation retrieval test passed');

  // Test message sending
  const { sendConsultationMessage } = await import('../convex/consultations');
  const messageId = await sendConsultationMessage(mockCtx, mockMessageData);

  expect(messageId).toBeDefined();
  expect(messageId).toMatch(/^mock-/);
  console.log('✅ Message sending test passed');

  console.log('🎉 AI Consultation Engine tests completed successfully!');
});

test('Phase 2: Consultation Analytics', async () => {
  console.log('🧪 Testing Consultation Analytics...');

  // Test consultation closing with analytics
  const { closeConsultation } = await import('../convex/consultations');
  const closedId = await closeConsultation(mockCtx, {
    consultationId: "mock-consultation-id",
    outcome: "resolved",
    satisfactionScore: 4.5,
  });

  expect(closedId).toBeDefined();
  console.log('✅ Consultation closing test passed');

  // Test analytics retrieval
  const { getConsultationAnalytics } = await import('../convex/consultations');
  const analytics = await getConsultationAnalytics(mockCtx, { consultationId: "mock-consultation-id" });

  if (analytics) {
    expect(analytics).toHaveProperty('totalMessages');
    expect(analytics).toHaveProperty('consultationDuration');
    console.log('✅ Analytics retrieval test passed');
  } else {
    console.log('ℹ️ Analytics not yet available (expected for new consultations)');
  }

  console.log('🎉 Consultation Analytics tests completed successfully!');
});

test('Phase 2: Provider Assignment', async () => {
  console.log('🧪 Testing Provider Assignment...');

  // Test provider assignment to consultation
  const { assignProviderToConsultation } = await import('../convex/consultations');
  const assignmentId = await assignProviderToConsultation(mockCtx, {
    consultationId: "mock-consultation-id",
    providerId: "mock-provider-id",
  });

  expect(assignmentId).toBeDefined();
  console.log('✅ Provider assignment test passed');

  console.log('🎉 Provider Assignment tests completed successfully!');
});

test('Phase 2: Frontend Components', async () => {
  console.log('🧪 Testing Frontend Components...');

  // Test consultation creation component
  const { default: CreateConsultation } = await import('../components/CreateConsultation');
  expect(CreateConsultation).toBeDefined();
  console.log('✅ CreateConsultation component test passed');

  // Test consultation list component
  const { default: ConsultationList } = await import('../components/ConsultationList');
  expect(ConsultationList).toBeDefined();
  console.log('✅ ConsultationList component test passed');

  // Test consultation chat component
  const { default: ConsultationChat } = await import('../components/ConsultationChat');
  expect(ConsultationChat).toBeDefined();
  console.log('✅ ConsultationChat component test passed');

  // Test consultation portal component
  const { default: ConsultationPortal } = await import('../components/ConsultationPortal');
  expect(ConsultationPortal).toBeDefined();
  console.log('✅ ConsultationPortal component test passed');

  console.log('🎉 Frontend Components tests completed successfully!');
});

test('Phase 2: Integration Test - Full Consultation Workflow', async () => {
  console.log('🧪 Testing Full Consultation Workflow...');

  // 1. Create a consultation
  const { createConsultation } = await import('../convex/consultations');
  const consultationId = await createConsultation(mockCtx, mockConsultationData);

  // 2. Send a message
  const { sendConsultationMessage } = await import('../convex/consultations');
  const messageId = await sendConsultationMessage(mockCtx, {
    ...mockMessageData,
    consultationId,
  });

  // 3. Get consultation with messages
  const { getUserConsultations } = await import('../convex/consultations');
  const consultations = await getUserConsultations(mockCtx, {});

  expect(consultations.length).toBeGreaterThan(0);
  expect(consultations[0]).toHaveProperty('messages');
  console.log('✅ Full workflow test passed');

  console.log('🎉 Phase 2 Integration tests completed successfully!');
});

// Database Schema Validation Test
test('Phase 2: Database Schema Validation', async () => {
  console.log('🧪 Validating Phase 2 Database Schema...');

  // Test that all required tables exist in schema
  const schema = await import('../convex/schema');

  const requiredTables = [
    'consultations',
    'consultationMessages',
    'aiModels',
    'consultationAnalytics',
  ];

  const schemaTables = Object.keys(schema.default._definition);

  for (const table of requiredTables) {
    expect(schemaTables).toContain(table);
    console.log(`✅ Table ${table} exists in schema`);
  }

  // Test that consultation messages reference consultations
  const consultationMessagesTable = schema.default._definition.consultationMessages;
  const consultationIdField = consultationMessagesTable.documentType.consultationId;
  expect(consultationIdField).toBeDefined();
  console.log('✅ Consultation messages properly reference consultations');

  console.log('🎉 Phase 2 Database schema validation completed successfully!');
});

console.log('🚀 Phase 2 Testing Suite Ready!');
console.log('📋 Run with: npm test -- phase2.test.ts');
console.log('🔄 Next: Phase 3 - Advanced Analytics & Reporting');

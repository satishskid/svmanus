import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // FIX: Renamed 'users' to 'userProfiles' and 'clerkId' to 'userId' to match the rest of the application.
  userProfiles: defineTable({
    name: v.string(),
    userId: v.string(), // This is the 'subject' from ctx.auth.getUserIdentity()
    role: v.union(v.literal("USER"), v.literal("HR"), v.literal("PROVIDER"), v.literal("MANAGER")),
    corporatePlanId: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  appointments: defineTable({
    // FIX: Changed userId to reference the userProfiles table.
    userId: v.id("userProfiles"),
    serviceId: v.string(),
    serviceName: v.string(),
    slotStartTime: v.number(),
    status: v.union(v.literal("Confirmed"), v.literal("Completed"), v.literal("Cancelled")),
    pricePaid: v.number(),
    notes: v.optional(v.string()),
    patientContext: v.union(v.literal("SELF"), v.literal("DAUGHTER"), v.literal("MOTHER")),
  }).index("by_user_id", ["userId"]),
  
  // FIX: Updated consultation messages to work with consultations instead of appointments.
  consultationMessages: defineTable({
    consultationId: v.id("consultations"),
    authorId: v.id("userProfiles"),
    authorRole: v.union(v.literal("USER"), v.literal("PROVIDER"), v.literal("AI")),
    messageType: v.union(v.literal("text"), v.literal("image"), v.literal("file"), v.literal("system")),
    content: v.string(),
    metadata: v.optional(v.any()), // JSON for additional data
    isAiGenerated: v.boolean(),
    confidenceScore: v.optional(v.number()), // For AI responses
    created_at: v.number(),
  }).index("by_consultation", ["consultationId"])
    .index("by_author", ["authorId"]),

  // === PHASE 1: Provider Management System ===
  providers: defineTable({
    name: v.string(),
    specialization: v.array(v.string()),
    license_number: v.string(),
    contact_info: v.object({
      email: v.string(),
      phone: v.string(),
      address: v.optional(v.string()),
    }),
    availability_schedule: v.any(), // JSON schedule configuration
    service_rates: v.object({
      consultation_fee: v.number(),
      follow_up_fee: v.number(),
      emergency_fee: v.optional(v.number()),
    }),
    is_active: v.boolean(),
    rating: v.number(),
    total_reviews: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_specialization", ["specialization"]),

  provider_schedules: defineTable({
    provider_id: v.id("providers"),
    day_of_week: v.number(), // 0-6 (Sunday-Saturday)
    start_time: v.string(), // "09:00"
    end_time: v.string(), // "17:00"
    slot_duration: v.number(), // minutes
    is_available: v.boolean(),
    created_at: v.number(),
  }).index("by_provider_day", ["provider_id", "day_of_week"]),

  provider_availability: defineTable({
    provider_id: v.id("providers"),
    date: v.number(), // timestamp
    start_time: v.number(),
    end_time: v.number(),
    is_booked: v.boolean(),
    appointment_id: v.optional(v.id("appointments")),
    created_at: v.number(),
  }).index("by_provider_date", ["provider_id", "date"]),

  // === PHASE 1: Enhanced Appointment System ===
  appointment_reminders: defineTable({
    appointment_id: v.id("appointments"),
    reminder_type: v.union(v.literal("email"), v.literal("sms"), v.literal("push"), v.literal("whatsapp")),
    scheduled_time: v.number(),
    sent_at: v.optional(v.number()),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("failed")),
    created_at: v.number(),
  }).index("by_appointment", ["appointment_id"]),

  appointment_reschedules: defineTable({
    original_appointment_id: v.id("appointments"),
    new_appointment_id: v.id("appointments"),
    reason: v.string(),
    requested_by: v.id("userProfiles"),
    approved_by: v.optional(v.id("userProfiles")),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    created_at: v.number(),
  }).index("by_original_appointment", ["original_appointment_id"]),

  // === PHASE 1: Contract Management ===
  contracts: defineTable({
    company_name: v.string(),
    company_size: v.number(),
    contract_type: v.union(v.literal("pilot"), v.literal("annual"), v.literal("multi_year")),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("expired"), v.literal("cancelled")),
    start_date: v.number(),
    end_date: v.number(),
    total_contract_value: v.number(),
    pricing_model: v.union(v.literal("per_employee"), v.literal("per_beneficiary"), v.literal("fixed_fee")),
    covered_services: v.array(v.string()),
    service_limits: v.any(), // JSON with service limitations
    negotiated_discounts: v.any(), // JSON with discount structures
    sla_terms: v.any(), // JSON with SLA terms
    created_by: v.id("userProfiles"),
    approved_by: v.optional(v.id("userProfiles")),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_company", ["company_name"]),

  // === PHASE 2: AI Consultation Engine ===
  consultations: defineTable({
    userId: v.id("userProfiles"),
    providerId: v.optional(v.id("providers")),
    title: v.string(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("paused"), v.literal("closed")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    category: v.string(), // "general", "emergency", "follow-up", "mental-health", etc.
    initialSymptoms: v.optional(v.string()),
    aiSummary: v.optional(v.string()),
    providerNotes: v.optional(v.string()),
    recommendations: v.optional(v.any()), // JSON with AI recommendations
    riskAssessment: v.optional(v.any()), // JSON with risk levels
    created_at: v.number(),
    updated_at: v.number(),
    closed_at: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_provider", ["providerId"])
    .index("by_status", ["status"]),

  aiModels: defineTable({
    name: v.string(),
    version: v.string(),
    capabilities: v.array(v.string()), // "symptom-analysis", "risk-assessment", "recommendations", etc.
    isActive: v.boolean(),
    accuracy: v.number(),
    responseTime: v.number(), // milliseconds
    costPerRequest: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_capability", ["capabilities"]),

  consultationAnalytics: defineTable({
    consultationId: v.id("consultations"),
    totalMessages: v.number(),
    aiMessages: v.number(),
    providerMessages: v.number(),
    userMessages: v.number(),
    averageResponseTime: v.number(),
    consultationDuration: v.number(), // minutes
    satisfactionScore: v.optional(v.number()),
    outcome: v.optional(v.string()),
    created_at: v.number(),
  }).index("by_consultation", ["consultationId"]),
});

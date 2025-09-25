import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// === PHASE 1: Contract Management Functions ===

// Create a new contract
export const createContract = mutation({
  args: {
    company_name: v.string(),
    company_size: v.number(),
    contract_type: v.union(v.literal("pilot"), v.literal("annual"), v.literal("multi_year")),
    start_date: v.number(),
    end_date: v.number(),
    total_contract_value: v.number(),
    pricing_model: v.union(v.literal("per_employee"), v.literal("per_beneficiary"), v.literal("fixed_fee")),
    covered_services: v.array(v.string()),
    service_limits: v.any(), // JSON with service limitations
    negotiated_discounts: v.any(), // JSON with discount structures
    sla_terms: v.any(), // JSON with SLA terms
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be logged in to create a contract.");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!userProfile || userProfile.role !== "MANAGER") {
      throw new Error("Only managers can create contracts.");
    }

    return await ctx.db.insert("contracts", {
      ...args,
      status: "draft",
      created_by: userProfile._id,
      approved_by: undefined,
      created_at: Date.now(),
      updated_at: Date.now(),
    });
  },
});

// Get all contracts
export const getAllContracts = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be logged in.");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!userProfile || !["MANAGER", "HR"].includes(userProfile.role)) {
      throw new Error("Only managers and HR can view contracts.");
    }

    return await ctx.db.query("contracts").collect();
  },
});

// Get contract by ID
export const getContractById = query({
  args: { contractId: v.id("contracts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be logged in.");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!userProfile || !["MANAGER", "HR"].includes(userProfile.role)) {
      throw new Error("Only managers and HR can view contract details.");
    }

    const contract = await ctx.db.get(args.contractId);
    if (!contract) {
      throw new Error("Contract not found.");
    }

    // Get contract beneficiaries
    const beneficiaries = await ctx.db
      .query("contract_beneficiaries")
      .withIndex("by_contract", (q) => q.eq("contract_id", args.contractId))
      .collect();

    // Get user profiles for beneficiaries
    const userIds = [...new Set(beneficiaries.map(b => b.user_profile_id))];
    const users = await Promise.all(
      userIds.map(userId => ctx.db.get(userId))
    );
    const usersMap = new Map(users.filter(Boolean).map(user => [user!._id, user!]));

    const beneficiariesWithUsers = beneficiaries.map(beneficiary => ({
      ...beneficiary,
      user: usersMap.get(beneficiary.user_profile_id),
    }));

    return {
      ...contract,
      beneficiaries: beneficiariesWithUsers,
    };
  },
});

// Update contract status
export const updateContractStatus = mutation({
  args: {
    contractId: v.id("contracts"),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("expired"), v.literal("cancelled")),
    approved_by: v.optional(v.id("userProfiles")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be logged in.");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!userProfile || userProfile.role !== "MANAGER") {
      throw new Error("Only managers can update contract status.");
    }

    const contract = await ctx.db.get(args.contractId);
    if (!contract) {
      throw new Error("Contract not found.");
    }

    await ctx.db.patch(args.contractId, {
      status: args.status,
      approved_by: args.approved_by,
      updated_at: Date.now(),
    });

    return args.contractId;
  },
});

// Add beneficiary to contract
export const addContractBeneficiary = mutation({
  args: {
    contractId: v.id("contracts"),
    user_profile_id: v.id("userProfiles"),
    beneficiary_type: v.union(v.literal("employee"), v.literal("spouse"), v.literal("daughter"), v.literal("mother")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be logged in.");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!userProfile || !["MANAGER", "HR"].includes(userProfile.role)) {
      throw new Error("Only managers and HR can add beneficiaries.");
    }

    const contract = await ctx.db.get(args.contractId);
    if (!contract) {
      throw new Error("Contract not found.");
    }

    // Check if beneficiary already exists
    const existingBeneficiary = await ctx.db
      .query("contract_beneficiaries")
      .withIndex("by_contract", (q) => q.eq("contract_id", args.contractId))
      .filter((q) => q.eq(q.field("user_profile_id"), args.user_profile_id))
      .first();

    if (existingBeneficiary) {
      throw new Error("Beneficiary already exists for this contract.");
    }

    return await ctx.db.insert("contract_beneficiaries", {
      contract_id: args.contractId,
      user_profile_id: args.user_profile_id,
      beneficiary_type: args.beneficiary_type,
      eligibility_status: "active",
      enrollment_date: Date.now(),
    });
  },
});

// Get contract utilization metrics
export const getContractUtilization = query({
  args: { contractId: v.id("contracts") },
  handler: async (ctx, args) => {
    const contract = await ctx.db.get(args.contractId);
    if (!contract) {
      throw new Error("Contract not found.");
    }

    // Get all beneficiaries
    const beneficiaries = await ctx.db
      .query("contract_beneficiaries")
      .withIndex("by_contract", (q) => q.eq("contract_id", args.contractId))
      .collect();

    const beneficiaryIds = beneficiaries.map(b => b.user_profile_id);

    // Get appointments for all beneficiaries
    const appointments = await ctx.db
      .query("appointments")
      .filter((q) => q.neq(q.field("status"), "Cancelled"))
      .collect();

    const contractAppointments = appointments.filter(apt =>
      beneficiaryIds.includes(apt.userId)
    );

    // Calculate utilization metrics
    const totalBeneficiaries = beneficiaries.filter(b => b.eligibility_status === "active").length;
    const totalAppointments = contractAppointments.length;
    const totalSpent = contractAppointments.reduce((sum, apt) => sum + apt.pricePaid, 0);

    // Group by service type
    const serviceBreakdown = contractAppointments.reduce((acc, apt) => {
      acc[apt.serviceName] = (acc[apt.serviceName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate monthly utilization
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const recentAppointments = contractAppointments.filter(apt =>
      apt._creationTime > thirtyDaysAgo
    );

    return {
      contract_id: args.contractId,
      total_beneficiaries: totalBeneficiaries,
      total_appointments: totalAppointments,
      total_spent: totalSpent,
      average_cost_per_beneficiary: totalBeneficiaries > 0 ? totalSpent / totalBeneficiaries : 0,
      average_appointments_per_beneficiary: totalBeneficiaries > 0 ? totalAppointments / totalBeneficiaries : 0,
      service_breakdown: serviceBreakdown,
      monthly_utilization: {
        appointments_last_30_days: recentAppointments.length,
        spent_last_30_days: recentAppointments.reduce((sum, apt) => sum + apt.pricePaid, 0),
      },
      contract_value_remaining: contract.total_contract_value - totalSpent,
      utilization_percentage: contract.total_contract_value > 0 ?
        (totalSpent / contract.total_contract_value) * 100 : 0,
    };
  },
});

// === Enhanced Appointment Functions ===

// Request appointment reschedule
export const requestAppointmentReschedule = mutation({
  args: {
    appointmentId: v.id("appointments"),
    newSlotStartTime: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be logged in.");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!userProfile) {
      throw new Error("User profile not found.");
    }

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found.");
    }

    if (appointment.userId !== userProfile._id && userProfile.role !== "PROVIDER") {
      throw new Error("Not authorized to reschedule this appointment.");
    }

    // Check if there's already a pending reschedule request
    const existingReschedule = await ctx.db
      .query("appointment_reschedules")
      .withIndex("by_original_appointment", (q) => q.eq("original_appointment_id", args.appointmentId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingReschedule) {
      throw new Error("There's already a pending reschedule request for this appointment.");
    }

    // Create a new appointment for the reschedule
    const service = (await import("./_data")).servicesMap.get(appointment.serviceId);
    if (!service) {
      throw new Error("Service not found.");
    }

    const newAppointmentId = await ctx.db.insert("appointments", {
      userId: appointment.userId,
      serviceId: appointment.serviceId,
      serviceName: appointment.serviceName,
      slotStartTime: args.newSlotStartTime,
      status: "Confirmed", // Will be updated based on approval
      patientContext: appointment.patientContext,
      pricePaid: appointment.pricePaid,
    });

    // Create reschedule request
    await ctx.db.insert("appointment_reschedules", {
      original_appointment_id: args.appointmentId,
      new_appointment_id: newAppointmentId,
      reason: args.reason,
      requested_by: userProfile._id,
      status: "pending",
      created_at: Date.now(),
    });

    return newAppointmentId;
  },
});

// Approve or reject reschedule request
export const approveRescheduleRequest = mutation({
  args: {
    rescheduleId: v.id("appointment_reschedules"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be logged in.");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!userProfile || userProfile.role !== "PROVIDER") {
      throw new Error("Only providers can approve reschedule requests.");
    }

    const rescheduleRequest = await ctx.db.get(args.rescheduleId);
    if (!rescheduleRequest) {
      throw new Error("Reschedule request not found.");
    }

    if (args.status === "approved") {
      // Update the original appointment status to cancelled
      await ctx.db.patch(rescheduleRequest.original_appointment_id, {
        status: "Cancelled",
      });

      // Update the new appointment status to confirmed
      await ctx.db.patch(rescheduleRequest.new_appointment_id, {
        status: "Confirmed",
      });

      // Update provider availability
      const originalAppointment = await ctx.db.get(rescheduleRequest.original_appointment_id);
      const newAppointment = await ctx.db.get(rescheduleRequest.new_appointment_id);

      if (originalAppointment && newAppointment) {
        // Mark original slot as available
        const originalDay = new Date(originalAppointment.slotStartTime);
        originalDay.setHours(0, 0, 0, 0);

        const originalBooking = await ctx.db
          .query("provider_availability")
          .withIndex("by_provider_date", (q) =>
            q.eq("date", originalDay.getTime())
            .eq("start_time", originalAppointment.slotStartTime)
          )
          .filter((q) => q.eq(q.field("is_booked"), true))
          .first();

        if (originalBooking) {
          await ctx.db.patch(originalBooking._id, { is_booked: false, appointment_id: undefined });
        }

        // Mark new slot as booked
        const newDay = new Date(newAppointment.slotStartTime);
        newDay.setHours(0, 0, 0, 0);

        const newBooking = await ctx.db
          .query("provider_availability")
          .withIndex("by_provider_date", (q) =>
            q.eq("date", newDay.getTime())
            .eq("start_time", newAppointment.slotStartTime)
          )
          .first();

        if (newBooking) {
          await ctx.db.patch(newBooking._id, {
            is_booked: true,
            appointment_id: newAppointment._id
          });
        }
      }
    } else {
      // Reject the reschedule - cancel the new appointment
      await ctx.db.patch(rescheduleRequest.new_appointment_id, {
        status: "Cancelled",
      });
    }

    await ctx.db.patch(args.rescheduleId, {
      status: args.status,
      approved_by: userProfile._id,
    });

    return args.rescheduleId;
  },
});

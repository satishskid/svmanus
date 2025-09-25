import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// === PHASE 1: Provider Management Functions ===

// Create a new provider
export const createProvider = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be logged in to create a provider.");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!userProfile || userProfile.role !== "MANAGER") {
      throw new Error("Only managers can create providers.");
    }

    return await ctx.db.insert("providers", {
      ...args,
      is_active: true,
      rating: 5.0,
      total_reviews: 0,
      created_at: Date.now(),
      updated_at: Date.now(),
    });
  },
});

// Get all providers
export const getAllProviders = query({
  handler: async (ctx) => {
    return await ctx.db.query("providers").filter((q) => q.eq(q.field("is_active"), true)).collect();
  },
});

// Get provider by ID
export const getProviderById = query({
  args: { providerId: v.id("providers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.providerId);
  },
});

// Update provider
export const updateProvider = mutation({
  args: {
    providerId: v.id("providers"),
    updates: v.object({
      name: v.optional(v.string()),
      specialization: v.optional(v.array(v.string())),
      license_number: v.optional(v.string()),
      contact_info: v.optional(v.object({
        email: v.string(),
        phone: v.string(),
        address: v.optional(v.string()),
      })),
      availability_schedule: v.optional(v.any()),
      service_rates: v.optional(v.object({
        consultation_fee: v.number(),
        follow_up_fee: v.number(),
        emergency_fee: v.optional(v.number()),
      })),
      is_active: v.optional(v.boolean()),
    }),
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
      throw new Error("Only managers and HR can update providers.");
    }

    const provider = await ctx.db.get(args.providerId);
    if (!provider) {
      throw new Error("Provider not found.");
    }

    await ctx.db.patch(args.providerId, {
      ...args.updates,
      updated_at: Date.now(),
    });

    return args.providerId;
  },
});

// === Provider Scheduling Functions ===

// Set provider availability schedule
export const setProviderSchedule = mutation({
  args: {
    providerId: v.id("providers"),
    schedules: v.array(v.object({
      day_of_week: v.number(), // 0-6
      start_time: v.string(), // "09:00"
      end_time: v.string(), // "17:00"
      slot_duration: v.number(), // minutes
      is_available: v.boolean(),
    })),
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

    if (!userProfile || !["MANAGER", "PROVIDER"].includes(userProfile.role)) {
      throw new Error("Only managers and providers can set schedules.");
    }

    // First, remove existing schedules for this provider
    const existingSchedules = await ctx.db
      .query("provider_schedules")
      .withIndex("by_provider_day", (q) => q.eq("provider_id", args.providerId))
      .collect();

    for (const schedule of existingSchedules) {
      await ctx.db.delete(schedule._id);
    }

    // Insert new schedules
    const scheduleIds = [];
    for (const schedule of args.schedules) {
      const scheduleId = await ctx.db.insert("provider_schedules", {
        provider_id: args.providerId,
        ...schedule,
        created_at: Date.now(),
      });
      scheduleIds.push(scheduleId);
    }

    return scheduleIds;
  },
});

// Get provider schedule
export const getProviderSchedule = query({
  args: { providerId: v.id("providers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("provider_schedules")
      .withIndex("by_provider_day", (q) => q.eq("provider_id", args.providerId))
      .collect();
  },
});

// Get available slots for a provider on a specific date
export const getProviderAvailableSlots = query({
  args: {
    providerId: v.id("providers"),
    date: v.number(), // timestamp for the day
  },
  handler: async (ctx, args) => {
    const dayStart = new Date(args.date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    // Get provider's schedule for this day of week
    const dayOfWeek = dayStart.getDay();
    const schedule = await ctx.db
      .query("provider_schedules")
      .withIndex("by_provider_day", (q) =>
        q.eq("provider_id", args.providerId).eq("day_of_week", dayOfWeek)
      )
      .filter((q) => q.eq(q.field("is_available"), true))
      .collect();

    if (schedule.length === 0) {
      return [];
    }

    // Get existing bookings for this day
    const existingBookings = await ctx.db
      .query("provider_availability")
      .withIndex("by_provider_date", (q) =>
        q.eq("provider_id", args.providerId).gte("date", dayStart.getTime()).lt("date", dayEnd.getTime())
      )
      .filter((q) => q.eq(q.field("is_booked"), true))
      .collect();

    const bookedSlots = new Set(existingBookings.map(b => b.start_time));

    const availableSlots = [];

    for (const sched of schedule) {
      const startTime = new Date(dayStart);
      const [startHour, startMinute] = sched.start_time.split(':').map(Number);
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(dayStart);
      const [endHour, endMinute] = sched.end_time.split(':').map(Number);
      endTime.setHours(endHour, endMinute, 0, 0);

      let currentSlot = new Date(startTime);

      while (currentSlot < endTime) {
        if (!bookedSlots.has(currentSlot.getTime())) {
          availableSlots.push({
            startTime: currentSlot.getTime(),
            endTime: currentSlot.getTime() + (sched.slot_duration * 60 * 1000),
            providerId: args.providerId,
          });
        }

        currentSlot = new Date(currentSlot.getTime() + (sched.slot_duration * 60 * 1000));
      }
    }

    return availableSlots;
  },
});

// === Enhanced Appointment Functions ===

// Create appointment with provider assignment
export const bookAppointmentWithProvider = mutation({
  args: {
    serviceId: v.string(),
    slotStartTime: v.number(),
    patientContext: v.union(v.literal("SELF"), v.literal("DAUGHTER"), v.literal("MOTHER")),
    pricePaid: v.number(),
    providerId: v.id("providers"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be logged in to book an appointment.");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!userProfile) {
      throw new Error("User profile not found.");
    }

    const service = (await import("./_data")).servicesMap.get(args.serviceId);
    if (!service) {
      throw new Error("Service not found.");
    }

    // Check if the slot is available
    const dayStart = new Date(args.slotStartTime);
    dayStart.setHours(0, 0, 0, 0);

    const conflictingBooking = await ctx.db
      .query("provider_availability")
      .withIndex("by_provider_date", (q) =>
        q.eq("provider_id", args.providerId)
        .eq("date", dayStart.getTime())
        .eq("start_time", args.slotStartTime)
      )
      .filter((q) => q.eq(q.field("is_booked"), true))
      .first();

    if (conflictingBooking) {
      throw new Error("This time slot is already booked.");
    }

    // Create the appointment
    const appointmentId = await ctx.db.insert("appointments", {
      userId: userProfile._id,
      serviceId: args.serviceId,
      serviceName: service.name,
      slotStartTime: args.slotStartTime,
      status: "Confirmed",
      patientContext: args.patientContext,
      pricePaid: args.pricePaid,
    });

    // Mark the slot as booked
    await ctx.db.insert("provider_availability", {
      provider_id: args.providerId,
      date: dayStart.getTime(),
      start_time: args.slotStartTime,
      end_time: args.slotStartTime + (60 * 60 * 1000), // 1 hour default
      is_booked: true,
      appointment_id: appointmentId,
      created_at: Date.now(),
    });

    // Schedule reminders
    const reminderTimes = [
      args.slotStartTime - (24 * 60 * 60 * 1000), // 24 hours before
      args.slotStartTime - (2 * 60 * 60 * 1000),   // 2 hours before
    ];

    for (const reminderTime of reminderTimes) {
      await ctx.db.insert("appointment_reminders", {
        appointment_id: appointmentId,
        reminder_type: "push", // Default to push notification
        scheduled_time: reminderTime,
        status: "pending",
        created_at: Date.now(),
      });
    }

    return appointmentId;
  },
});

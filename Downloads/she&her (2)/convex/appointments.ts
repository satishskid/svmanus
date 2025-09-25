import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { servicesMap } from "./_data";

// Get all appointments - for HR and Provider views
export const getAllAppointments = query({
  handler: async (ctx) => {
    const appointments = await ctx.db.query("appointments").order("desc").collect();
    
    // Fetch unique users for these appointments
    const userIds = [...new Set(appointments.map(a => a.userId))];
    const users = await Promise.all(
      // FIX: The table is userProfiles, not users. The ID on appointment is an Id("userProfiles")
      userIds.map(userId => ctx.db.get(userId))
    );
    const usersMap = new Map(users.filter(Boolean).map(user => [user!._id, user!]));

    return appointments.map(appt => {
      const user = usersMap.get(appt.userId);
      const service = servicesMap.get(appt.serviceId);
      return {
        ...appt,
        user: user || null,
        service: service || null,
      };
    });
  },
});


// Get appointments for the currently logged-in user
export const getMyAppointments = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        // FIX: Query 'userProfiles' table using 'by_user_id' index instead of 'users' and 'by_clerk_id'.
        const userProfile = await ctx.db.query("userProfiles").withIndex("by_user_id", q => q.eq("userId", identity.subject)).unique();
        if (!userProfile) {
            return [];
        }

        const appointments = await ctx.db.query("appointments").withIndex("by_user_id", q => q.eq("userId", userProfile._id)).order("desc").collect();
        return appointments.map(appt => {
            const service = servicesMap.get(appt.serviceId);
            return {
                ...appt,
                user: userProfile,
                service,
            };
        });
    },
});

// Book a new appointment
export const bookAppointment = mutation({
  args: {
    serviceId: v.string(),
    slotStartTime: v.number(),
    patientContext: v.union(v.literal("SELF"), v.literal("DAUGHTER"), v.literal("MOTHER")),
    pricePaid: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User must be logged in to book an appointment.");
    }
    
    // FIX: Query 'userProfiles' table using 'by_user_id' index instead of 'users' and 'by_clerk_id'.
    const userProfile = await ctx.db.query("userProfiles").withIndex("by_user_id", (q) => q.eq("userId", identity.subject)).unique();
    if (!userProfile) {
      throw new Error("User profile not found.");
    }

    const service = servicesMap.get(args.serviceId);
    if (!service) {
      throw new Error("Service not found.");
    }

    const appointmentId = await ctx.db.insert("appointments", {
      userId: userProfile._id,
      serviceId: args.serviceId,
      serviceName: service.name,
      slotStartTime: args.slotStartTime,
      status: "Confirmed",
      patientContext: args.patientContext,
      pricePaid: args.pricePaid,
    });
    
    return appointmentId;
  },
});

// Update appointment status (for providers)
export const updateAppointmentStatus = mutation({
  args: {
    id: v.id("appointments"),
    status: v.union(v.literal("Confirmed"), v.literal("Completed"), v.literal("Cancelled")),
  },
  handler: async (ctx, { id, status }) => {
    // In a real app, you'd check if the user is a provider and authorized
    return await ctx.db.patch(id, { status });
  },
});

// Add notes to a completed appointment (for providers)
export const addAppointmentNotes = mutation({
  args: {
    id: v.id("appointments"),
    notes: v.string(),
  },
  handler: async (ctx, { id, notes }) => {
    // In a real app, you'd check if the user is a provider and authorized
    const appointment = await ctx.db.get(id);
    if (appointment?.status !== "Completed") {
        throw new Error("Can only add notes to completed appointments.");
    }
    return await ctx.db.patch(id, { notes });
  },
});
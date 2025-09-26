import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seeds the database with demo data for testing and demonstration purposes.
 * This creates sample users with different roles and some appointments.
 */
export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // Temporarily remove authentication requirement for demo
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Must be authenticated to seed demo data");
    // }

    // Check if demo data already exists
    const existingUsers = await ctx.db.query("userProfiles").collect();
    if (existingUsers.length > 0) {
      throw new Error("Demo data already exists. Please clear the database first.");
    }

    // Create demo users with different roles
    const demoUsers = [
      {
        name: "Sarah Johnson",
        userId: "demo-user-1",
        role: "USER" as const,
        corporatePlanId: undefined,
      },
      {
        name: "Dr. Emily Chen",
        userId: "demo-provider-1",
        role: "PROVIDER" as const,
        corporatePlanId: undefined,
      },
      {
        name: "HR Manager",
        userId: "demo-hr-1",
        role: "HR" as const,
        corporatePlanId: "corporate-plan-1",
      },
      {
        name: "System Admin",
        userId: "demo-manager-1",
        role: "MANAGER" as const,
        corporatePlanId: undefined,
      }
    ];

    const userIds: string[] = [];

    for (const user of demoUsers) {
      const userId = await ctx.db.insert("userProfiles", user);
      userIds.push(userId);
    }

    // Create some demo appointments
    const appointments = [
      {
        userId: userIds[0] as any, // Sarah Johnson (USER)
        serviceId: "menstrual-health",
        serviceName: "Menstrual Health Consultation",
        slotStartTime: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1 week ago
        status: "Completed" as const,
        pricePaid: 150,
        patientContext: "SELF" as const,
      },
      {
        userId: userIds[0] as any, // Sarah Johnson (USER)
        serviceId: "pregnancy-planning",
        serviceName: "Pregnancy Planning Consultation",
        slotStartTime: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
        status: "Confirmed" as const,
        pricePaid: 200,
        patientContext: "SELF" as const,
      },
      {
        userId: userIds[2] as any, // HR Manager (HR)
        serviceId: "corporate-wellness",
        serviceName: "Corporate Wellness Program",
        slotStartTime: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        status: "Completed" as const,
        pricePaid: 500,
        patientContext: "DAUGHTER" as const,
      }
    ];

    const appointmentIds: string[] = [];

    for (const appointment of appointments) {
      const appointmentId = await ctx.db.insert("appointments", appointment);
      appointmentIds.push(appointmentId);
    }

    // Create some demo consultation messages
    const messages = [
      {
        consultationId: appointmentIds[0] as any, // Completed appointment
        authorId: userIds[1] as any, // Dr. Emily Chen (PROVIDER)
        authorRole: "PROVIDER" as const,
        messageType: "text" as const,
        content: "Thank you for your consultation, Sarah. Your menstrual health looks good overall. I've prescribed some supplements to help with the cramps you mentioned.",
        isAiGenerated: false,
        created_at: Date.now(),
      },
      {
        consultationId: appointmentIds[0] as any, // Completed appointment
        authorId: userIds[0] as any, // Sarah Johnson (USER)
        authorRole: "USER" as const,
        messageType: "text" as const,
        content: "Thank you Dr. Chen! I feel much better after our session. The supplements have really helped.",
        isAiGenerated: false,
        created_at: Date.now(),
      },
      {
        consultationId: appointmentIds[1] as any, // Confirmed appointment
        authorId: userIds[1] as any, // Dr. Emily Chen (PROVIDER)
        authorRole: "PROVIDER" as const,
        messageType: "text" as const,
        content: "Great to hear! For your pregnancy planning, I recommend starting prenatal vitamins now. Let's schedule a follow-up in 3 months to monitor your progress.",
        isAiGenerated: false,
        created_at: Date.now(),
      },
      {
        consultationId: appointmentIds[2] as any, // Corporate appointment
        authorId: userIds[1] as any, // Dr. Emily Chen (PROVIDER)
        authorRole: "PROVIDER" as const,
        messageType: "text" as const,
        content: "Your corporate wellness consultation is complete. I've provided recommendations for your team's health and wellness program.",
        isAiGenerated: false,
        created_at: Date.now(),
      }
    ];

    for (const message of messages) {
      await ctx.db.insert("consultationMessages", message);
    }

    return {
      message: "Demo data seeded successfully!",
      users: demoUsers.length,
      appointments: appointments.length,
      messages: messages.length,
    };
  },
});

/**
 * Clears all demo data from the database.
 */
export const clearDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // Temporarily remove authentication requirement for demo
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Must be authenticated to clear demo data");
    // }

    // Delete all consultation messages
    const messages = await ctx.db.query("consultationMessages").collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete all appointments
    const appointments = await ctx.db.query("appointments").collect();
    for (const appointment of appointments) {
      await ctx.db.delete(appointment._id);
    }

    // Delete all user profiles
    const users = await ctx.db.query("userProfiles").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    return {
      message: "Demo data cleared successfully!",
      deletedUsers: users.length,
      deletedAppointments: appointments.length,
      deletedMessages: messages.length,
    };
  },
});

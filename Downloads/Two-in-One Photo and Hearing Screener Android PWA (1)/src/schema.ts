import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Vision Screening Sessions
 * Stores metadata about each vision screening session
 */
export const visionScreeningSessions = mysqlTable("vision_screening_sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  sessionDate: timestamp("sessionDate").defaultNow().notNull(),
  ageGroup: mysqlEnum("ageGroup", ["0-2", "3-5", "6-12", "13-18", "18+"]).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type VisionScreeningSession = typeof visionScreeningSessions.$inferSelect;
export type InsertVisionScreeningSession = typeof visionScreeningSessions.$inferInsert;

/**
 * Photoscreening Results
 * Stores results from photoscreening (red reflex, eye alignment detection)
 */
export const photoscreeningResults = mysqlTable("photoscreening_results", {
  id: varchar("id", { length: 64 }).primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  eyeSide: mysqlEnum("eyeSide", ["left", "right", "both"]).notNull(),
  redReflexStatus: mysqlEnum("redReflexStatus", ["normal", "abnormal", "unclear"]),
  eyeAlignment: mysqlEnum("eyeAlignment", ["normal", "esotropia", "exotropia", "unclear"]),
  refractionEstimate: varchar("refractionEstimate", { length: 50 }), // e.g., "-2.50 D"
  imageUrl: text("imageUrl"), // S3 URL to stored image
  confidence: int("confidence"), // 0-100 confidence score
  flaggedForReview: boolean("flaggedForReview").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type PhotoscreeningResult = typeof photoscreeningResults.$inferSelect;
export type InsertPhotoscreeningResult = typeof photoscreeningResults.$inferInsert;

/**
 * Visual Acuity Test Results
 * Stores results from visual acuity testing (Snellen-like charts)
 */
export const visualAcuityResults = mysqlTable("visual_acuity_results", {
  id: varchar("id", { length: 64 }).primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  eyeSide: mysqlEnum("eyeSide", ["left", "right", "both"]).notNull(),
  acuityMeasurement: varchar("acuityMeasurement", { length: 20 }).notNull(), // e.g., "20/40"
  acuityDecimal: decimal("acuityDecimal", { precision: 3, scale: 2 }), // e.g., 0.50
  testMethod: mysqlEnum("testMethod", ["snellen", "tumbling_e", "lea_symbols", "picture_matching"]).notNull(),
  distanceMeters: int("distanceMeters").notNull(), // Distance at which test was conducted
  correctionUsed: boolean("correctionUsed").default(false),
  correctionType: varchar("correctionType", { length: 50 }), // e.g., "glasses", "contact_lens"
  flaggedForReview: boolean("flaggedForReview").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type VisualAcuityResult = typeof visualAcuityResults.$inferSelect;
export type InsertVisualAcuityResult = typeof visualAcuityResults.$inferInsert;

/**
 * Hearing Screening Sessions
 * Stores metadata about each hearing screening session
 */
export const hearingScreeningSessions = mysqlTable("hearing_screening_sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  sessionDate: timestamp("sessionDate").defaultNow().notNull(),
  ageGroup: mysqlEnum("ageGroup", ["0-2", "3-5", "6-12", "13-18", "18+"]).notNull(),
  environmentNoise: int("environmentNoise"), // dB SPL measurement of background noise
  calibrationStatus: mysqlEnum("calibrationStatus", ["not_calibrated", "calibrated", "needs_recalibration"]).default("not_calibrated"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type HearingScreeningSession = typeof hearingScreeningSessions.$inferSelect;
export type InsertHearingScreeningSession = typeof hearingScreeningSessions.$inferInsert;

/**
 * Pure Tone Audiometry Results
 * Stores hearing thresholds at different frequencies
 */
export const pureToneAudiometryResults = mysqlTable("pure_tone_audiometry_results", {
  id: varchar("id", { length: 64 }).primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  earSide: mysqlEnum("earSide", ["left", "right"]).notNull(),
  frequency: int("frequency").notNull(), // Hz (e.g., 250, 500, 1000, 2000, 4000, 8000)
  threshold: int("threshold").notNull(), // dB HL (Hearing Level)
  conduction: mysqlEnum("conduction", ["air", "bone"]).notNull(),
  flaggedForReview: boolean("flaggedForReview").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type PureToneAudiometryResult = typeof pureToneAudiometryResults.$inferSelect;
export type InsertPureToneAudiometryResult = typeof pureToneAudiometryResults.$inferInsert;

/**
 * Speech-in-Noise Test Results
 * Stores results from speech perception in noise tests
 */
export const speechInNoiseResults = mysqlTable("speech_in_noise_results", {
  id: varchar("id", { length: 64 }).primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  testType: mysqlEnum("testType", ["quick_sin", "azbio", "hint", "custom"]).notNull(),
  signalNoiseRatio: int("signalNoiseRatio"), // dB SNR (Signal-to-Noise Ratio)
  percentCorrect: int("percentCorrect").notNull(), // 0-100
  wordsPresented: int("wordsPresented"),
  wordsCorrect: int("wordsCorrect"),
  presentationLevel: int("presentationLevel"), // dB SPL
  flaggedForReview: boolean("flaggedForReview").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type SpeechInNoiseResult = typeof speechInNoiseResults.$inferSelect;
export type InsertSpeechInNoiseResult = typeof speechInNoiseResults.$inferInsert;

/**
 * Screening Summary Report
 * Stores overall assessment and recommendations from a screening session
 */
export const screeningSummaryReports = mysqlTable("screening_summary_reports", {
  id: varchar("id", { length: 64 }).primaryKey(),
  visionSessionId: varchar("visionSessionId", { length: 64 }),
  hearingSessionId: varchar("hearingSessionId", { length: 64 }),
  userId: varchar("userId", { length: 64 }).notNull(),
  overallStatus: mysqlEnum("overallStatus", ["pass", "refer", "inconclusive"]).notNull(),
  visionStatus: mysqlEnum("visionStatus", ["pass", "refer", "inconclusive", "not_tested"]),
  hearingStatus: mysqlEnum("hearingStatus", ["pass", "refer", "inconclusive", "not_tested"]),
  visionRecommendations: text("visionRecommendations"),
  hearingRecommendations: text("hearingRecommendations"),
  followUpRequired: boolean("followUpRequired").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type ScreeningSummaryReport = typeof screeningSummaryReports.$inferSelect;
export type InsertScreeningSummaryReport = typeof screeningSummaryReports.$inferInsert;

/**
 * Whitelist Entries
 * Stores whitelisted emails with subscription tier and access duration
 */
export const whitelistEntries = mysqlTable("whitelist_entries", {
  id: varchar("id", { length: 64 }).primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  subscriptionTier: mysqlEnum("subscriptionTier", ["trial", "paid"]).notNull(),
  accessDurationDays: int("accessDurationDays").notNull(),
  status: mysqlEnum("status", ["active", "expired", "revoked"]).default("active").notNull(),
  addedBy: varchar("addedBy", { length: 64 }).notNull(),
  addedAt: timestamp("addedAt").defaultNow(),
  expiresAt: timestamp("expiresAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type WhitelistEntry = typeof whitelistEntries.$inferSelect;
export type InsertWhitelistEntry = typeof whitelistEntries.$inferInsert;

/**
 * User Access Logs
 * Tracks when users access the app and their subscription status
 */
export const userAccessLogs = mysqlTable("user_access_logs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subscriptionTier: mysqlEnum("subscriptionTier", ["trial", "paid"]),
  accessGrantedAt: timestamp("accessGrantedAt"),
  accessExpiresAt: timestamp("accessExpiresAt"),
  lastAccessedAt: timestamp("lastAccessedAt"),
  status: mysqlEnum("status", ["active", "expired", "revoked"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type UserAccessLog = typeof userAccessLogs.$inferSelect;
export type InsertUserAccessLog = typeof userAccessLogs.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  visionSessions: many(visionScreeningSessions),
  hearingSessions: many(hearingScreeningSessions),
  reports: many(screeningSummaryReports),
}));

export const visionScreeningSessionsRelations = relations(visionScreeningSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [visionScreeningSessions.userId],
    references: [users.id],
  }),
  photoscreeningResults: many(photoscreeningResults),
  visualAcuityResults: many(visualAcuityResults),
}));

export const photoscreeningResultsRelations = relations(photoscreeningResults, ({ one }) => ({
  session: one(visionScreeningSessions, {
    fields: [photoscreeningResults.sessionId],
    references: [visionScreeningSessions.id],
  }),
}));

export const visualAcuityResultsRelations = relations(visualAcuityResults, ({ one }) => ({
  session: one(visionScreeningSessions, {
    fields: [visualAcuityResults.sessionId],
    references: [visionScreeningSessions.id],
  }),
}));

export const hearingScreeningSessionsRelations = relations(hearingScreeningSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [hearingScreeningSessions.userId],
    references: [users.id],
  }),
  pureToneResults: many(pureToneAudiometryResults),
  speechInNoiseResults: many(speechInNoiseResults),
}));

export const pureToneAudiometryResultsRelations = relations(pureToneAudiometryResults, ({ one }) => ({
  session: one(hearingScreeningSessions, {
    fields: [pureToneAudiometryResults.sessionId],
    references: [hearingScreeningSessions.id],
  }),
}));

export const speechInNoiseResultsRelations = relations(speechInNoiseResults, ({ one }) => ({
  session: one(hearingScreeningSessions, {
    fields: [speechInNoiseResults.sessionId],
    references: [hearingScreeningSessions.id],
  }),
}));

export const screeningSummaryReportsRelations = relations(screeningSummaryReports, ({ one }) => ({
  user: one(users, {
    fields: [screeningSummaryReports.userId],
    references: [users.id],
  }),
  visionSession: one(visionScreeningSessions, {
    fields: [screeningSummaryReports.visionSessionId],
    references: [visionScreeningSessions.id],
  }),
  hearingSession: one(hearingScreeningSessions, {
    fields: [screeningSummaryReports.hearingSessionId],
    references: [hearingScreeningSessions.id],
  }),
}));


import { eq, and, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  visionScreeningSessions,
  InsertVisionScreeningSession,
  photoscreeningResults,
  InsertPhotoscreeningResult,
  visualAcuityResults,
  InsertVisualAcuityResult,
  hearingScreeningSessions,
  InsertHearingScreeningSession,
  pureToneAudiometryResults,
  InsertPureToneAudiometryResult,
  speechInNoiseResults,
  InsertSpeechInNoiseResult,
  screeningSummaryReports,
  InsertScreeningSummaryReport,
  whitelistEntries,
  InsertWhitelistEntry,
  userAccessLogs,
  InsertUserAccessLog,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.


// Vision Screening Functions
export async function createVisionScreeningSession(
  session: InsertVisionScreeningSession
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(visionScreeningSessions).values(session);
  return session.id;
}

export async function addPhotoscreeningResult(
  result: InsertPhotoscreeningResult
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(photoscreeningResults).values(result);
}

export async function addVisualAcuityResult(
  result: InsertVisualAcuityResult
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(visualAcuityResults).values(result);
}

// Hearing Screening Functions
export async function createHearingScreeningSession(
  session: InsertHearingScreeningSession
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(hearingScreeningSessions).values(session);
  return session.id;
}

export async function addPureToneAudiometryResult(
  result: InsertPureToneAudiometryResult
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(pureToneAudiometryResults).values(result);
}

export async function addSpeechInNoiseResult(
  result: InsertSpeechInNoiseResult
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(speechInNoiseResults).values(result);
}

// Summary Report Functions
export async function createScreeningSummaryReport(
  report: InsertScreeningSummaryReport
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(screeningSummaryReports).values(report);
  return report.id;
}

export async function getUserScreeningHistory(userId: string) {
  const db = await getDb();
  if (!db) return { visionSessions: [], hearingSessions: [], reports: [] };
  
  const visionSessions = await db
    .select()
    .from(visionScreeningSessions)
    .where(eq(visionScreeningSessions.userId, userId));
  
  const hearingSessions = await db
    .select()
    .from(hearingScreeningSessions)
    .where(eq(hearingScreeningSessions.userId, userId));
  
  const reports = await db
    .select()
    .from(screeningSummaryReports)
    .where(eq(screeningSummaryReports.userId, userId));
  
  return { visionSessions, hearingSessions, reports };
}

export async function getVisionSessionDetails(sessionId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const session = await db
    .select()
    .from(visionScreeningSessions)
    .where(eq(visionScreeningSessions.id, sessionId))
    .limit(1);
  
  if (session.length === 0) return null;
  
  const photoResults = await db
    .select()
    .from(photoscreeningResults)
    .where(eq(photoscreeningResults.sessionId, sessionId));
  
  const acuityResults = await db
    .select()
    .from(visualAcuityResults)
    .where(eq(visualAcuityResults.sessionId, sessionId));
  
  return {
    session: session[0],
    photoscreeningResults: photoResults,
    visualAcuityResults: acuityResults,
  };
}

export async function getHearingSessionDetails(sessionId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const session = await db
    .select()
    .from(hearingScreeningSessions)
    .where(eq(hearingScreeningSessions.id, sessionId))
    .limit(1);
  
  if (session.length === 0) return null;
  
  const pureResults = await db
    .select()
    .from(pureToneAudiometryResults)
    .where(eq(pureToneAudiometryResults.sessionId, sessionId));
  
  const speechResults = await db
    .select()
    .from(speechInNoiseResults)
    .where(eq(speechInNoiseResults.sessionId, sessionId));
  
  return {
    session: session[0],
    pureToneResults: pureResults,
    speechInNoiseResults: speechResults,
  };
}



// Whitelisting Functions
export async function addToWhitelist(
  entry: InsertWhitelistEntry
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(whitelistEntries).values(entry);
}

export async function getWhitelistEntry(email: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(whitelistEntries)
    .where(eq(whitelistEntries.email, email))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getAllWhitelistEntries() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(whitelistEntries);
}

export async function updateWhitelistEntry(
  email: string,
  updates: Partial<InsertWhitelistEntry>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(whitelistEntries)
    .set(updates)
    .where(eq(whitelistEntries.email, email));
}

export async function deleteFromWhitelist(email: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(whitelistEntries)
    .where(eq(whitelistEntries.email, email));
}

// User Access Log Functions
export async function createAccessLog(
  log: InsertUserAccessLog
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(userAccessLogs).values(log);
}

export async function getUserAccessLog(userId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(userAccessLogs)
    .where(eq(userAccessLogs.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateAccessLog(
  userId: string,
  updates: Partial<InsertUserAccessLog>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(userAccessLogs)
    .set(updates)
    .where(eq(userAccessLogs.userId, userId));
}

export async function checkUserAccess(userId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const accessLog = await db
    .select()
    .from(userAccessLogs)
    .where(
      and(
        eq(userAccessLogs.userId, userId),
        eq(userAccessLogs.status, "active"),
        gt(userAccessLogs.accessExpiresAt, new Date())
      )
    )
    .limit(1);
  
  return accessLog.length > 0;
}


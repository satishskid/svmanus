/**
 * Core Data Types & Interfaces
 * Shared across mobile app and admin portal
 */

/**
 * Child Profile from QR or manual entry
 */
export interface ChildProfile {
  childId: string;
  name: string;
  dateOfBirth: string; // ISO 8601: YYYY-MM-DD
  schoolCode?: string;
  gradeLevel?: string;
  parentEmail?: string;
}

/**
 * Vision Screening Result
 */
export interface VisionResult {
  logMAR: number; // 0.0 (best) to 1.0+ (worst)
  snellenEquivalent: string; // e.g., "20/20", "20/60"
  pass: boolean; // true if logMAR <= 0.3
  confidence: number; // 0-100: how confident in result
  testDuration: number; // milliseconds
  reversals: number; // number of direction changes in staircase
  notes?: string;
}

/**
 * Hearing Screening Result (Play Audiometry)
 */
export interface HearingResult {
  frequencies: {
    [key in "1000" | "2000" | "4000"]: {
      detected: boolean; // child detected tone at 30 dB HL
      confidence: number; // 0-100
    };
  };
  pass: boolean; // true if detected all 3 frequencies
  testDuration: number; // milliseconds
  notes?: string;
}

/**
 * Complete Screening Result combining vision + hearing
 */
export interface ScreeningResult {
  // Identifiers
  id: string; // UUID
  childId: string; // Reference to child
  screeningDate: string; // ISO 8601: YYYY-MM-DDTHH:mm:ssZ
  
  // Child Details (snapshot at time of screening)
  childProfile: ChildProfile;
  
  // Screening Results
  vision: VisionResult | null; // null if not tested
  hearing: HearingResult | null; // null if not tested
  
  // Referral Logic
  referralNeeded: boolean;
  referralReasons: string[]; // ["vision_refer", "hearing_refer", etc.]
  passStatus: "pass" | "refer" | "incomplete";
  
  // Metadata
  screenerId: string; // ID of health worker
  screenerName: string;
  schoolCode: string;
  offlineMode: boolean; // true if created offline
  syncedAt?: string; // ISO 8601, null if not yet synced
  
  // Additional Notes
  externalNotes?: string;
  imageReference?: string; // Reference to captured images (red reflex, etc.)
}

/**
 * FHIR R4 Observation for LOINC codes
 */
export interface FHIRObservation {
  resourceType: "Observation";
  status: "final" | "preliminary" | "amended";
  code: {
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
  };
  subject: {
    reference: string;
  };
  effectiveDateTime: string;
  valueString?: string;
  valueQuantity?: {
    value: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  interpretation?: Array<{
    coding: Array<{
      system: string;
      code: string;
    }>;
  }>;
}

/**
 * FHIR R4 Patient Resource
 */
export interface FHIRPatient {
  resourceType: "Patient";
  id: string;
  identifier?: Array<{
    system: string;
    value: string;
  }>;
  name?: Array<{
    text?: string;
    given?: string[];
    family?: string;
  }>;
  birthDate?: string;
  gender?: "male" | "female" | "other" | "unknown";
  address?: Array<{
    country?: string;
    state?: string;
    city?: string;
  }>;
}

/**
 * FHIR R4 DiagnosticReport (screening summary)
 */
export interface FHIRDiagnosticReport {
  resourceType: "DiagnosticReport";
  status: "final" | "preliminary";
  code: {
    coding: Array<{
      system: string;
      code: string;
    }>;
  };
  subject: {
    reference: string;
  };
  effectiveDateTime: string;
  issued: string;
  result: Array<{
    reference: string;
  }>;
  conclusion?: string;
}

/**
 * FHIR R4 Bundle containing all screening data
 */
export interface FHIRBundle {
  resourceType: "Bundle";
  type: "collection" | "transaction" | "batch";
  id: string;
  timestamp: string;
  entry: Array<{
    fullUrl: string;
    resource: FHIRPatient | FHIRObservation | FHIRDiagnosticReport;
  }>;
}

/**
 * Analytics Summary (for dashboard)
 */
export interface AnalyticsSummary {
  periodStart: string; // ISO 8601
  periodEnd: string; // ISO 8601
  
  totalScreened: number;
  visionPass: number;
  visionRefer: number;
  hearingPass: number;
  hearingRefer: number;
  
  visionPassRate: number; // 0-100
  hearingPassRate: number; // 0-100
  
  averageVisionLogMAR: number;
  averageTestDuration: number; // seconds
  
  // Breakdown by age groups
  ageBreakdown: {
    [ageGroup: string]: {
      screened: number;
      visionRefer: number;
      hearingRefer: number;
    };
  };
  
  // Breakdown by schools/regions
  locationBreakdown: {
    [location: string]: {
      screened: number;
      visionRefer: number;
      hearingRefer: number;
    };
  };
}

/**
 * Sync Queue Item (for offline-first architecture)
 */
export interface SyncQueueItem {
  id: string;
  type: "screening_result" | "child_profile" | "roster_update";
  data: ScreeningResult | ChildProfile | unknown;
  createdAt: string;
  attempts: number;
  lastAttempt?: string;
  status: "pending" | "syncing" | "synced" | "failed";
  error?: string;
}

/**
 * School Roster Import Format
 */
export interface StudentRosterRow {
  student_id: string;
  full_name: string;
  date_of_birth: string; // YYYY-MM-DD
  grade?: string;
  section?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
}

/**
 * Export Format Options
 */
export type ExportFormat = "fhir" | "hl7" | "csv" | "pdf" | "xlsx";

export interface ExportOptions {
  format: ExportFormat;
  startDate?: string;
  endDate?: string;
  schoolCode?: string;
  includeImages?: boolean;
}

/**
 * Screening Algorithm Constants
 */
export const VISION_PASS_THRESHOLD = 0.3; // logMAR
export const HEARING_PASS_THRESHOLD = 3; // must detect all 3 frequencies

export const LOGMAR_LEVELS = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
export const HEARING_FREQUENCIES = [1000, 2000, 4000] as const;
export const HEARING_INTENSITY_DBHL = 30; // dB HL

/**
 * LOINC Code Mappings
 */
export const LOINC_CODES = {
  VISION_ACUITY: "59610-3",
  HEARING_SCREENING: "69737-5",
  STEREO_VISION: "71488-2",
  RED_REFLEX: "53578-5",
  REFRACTIVE_ERROR: "79894-5",
} as const;

/**
 * HL7 Segment Templates
 */
export const HL7_SEGMENTS = {
  MSH: "MSH|^~\\&|SKIDS_EYEAR|{sendingFacility}|||{timestamp}||ORU^R01|{messageId}|P|2.5",
  PID: "PID|1||{patientId}||{patientName}||{dob}",
  OBR: "OBR|1|{orderId}||VISION-HEARING-SCREEN||||{timestamp}",
  OBX: "OBX|{sequence}|ST|{code}||{value}|||F",
} as const;

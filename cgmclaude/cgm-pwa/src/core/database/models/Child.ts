import { MeasurementRecord } from './Measurement';

export interface VaccinationRecord {
  vaccineName: string;
  date: Date;
  doses: number;
}

export interface ChildRecord {
  // Core Identification
  id: string;                    // UUID v4
  localId: string;              // Sequential local ID
  name: string;                 // Full name
  dateOfBirth: Date;            // Birth date
  sex: 'M' | 'F';              // Biological sex

  // Guardian Information
  guardianInfo: {
    primaryGuardian: {
      name: string;
      relationship: 'mother' | 'father' | 'grandparent' | 'other';
      phone?: string;
      education?: string;
    };
    secondaryGuardian?: {
      name: string;
      relationship: string;
      phone?: string;
    };
  };

  // Location Data
  address: {
    village?: string;
    block?: string;
    district?: string;
    state?: string;
    pincode?: string;
    gpsCoordinates?: {lat: number, lng: number};
  };

  // Medical History
  medicalHistory: {
    birthWeight?: number;         // kg
    gestationalAge?: number;      // weeks
    deliveryType?: 'normal' | 'cesarean';
    complications?: string[];
    vaccinationStatus?: VaccinationRecord[];
    chronicConditions?: string[];
    previousMalnutrition?: boolean;
  };

  // Administrative
  metadata: {
    registeredBy: string;         // Health worker ID
    registrationDate: Date;
    lastUpdated: Date;
    dataSource: 'manual' | 'import' | 'transfer';
    qualityScore: number;         // Overall data quality (0-100)
  };

  // Measurements Collection
  measurements: MeasurementRecord[];

  // Analytics
  analytics: {
    totalVisits: number;
    lastVisitDate?: Date;
    growthTrend: 'improving' | 'stable' | 'declining';
    riskScore: number;            // Calculated risk (0-100)
    interventionsNeeded: string[];
  };
}
